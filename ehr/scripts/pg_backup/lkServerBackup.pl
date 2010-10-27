#!/usr/bin/perl


=head1 NAME

lkServerBackup.pl

=head1 DESCRIPTION

This script is used to backup the postgres db on LabKey Servers  

One or more DB schemas can be selected. Each schema gets dumped into a separate file. These
files are automatically rotated according to the user defined schedule. 


=head1 LICENSE

This package and its accompanying libraries are free software; you can
redistribute it and/or modify it under the terms of the GPL (either
version 1, or at your option, any later version) or the Artistic
License 2.0.   

=head1 AUTHOR

Ben Bimber

bimber at wisc dot edu

=head1 USAGE

All config settings are specified in an INI file in the same folder as this script. Below
is a sample INI

The postgres authentication is handled using a file named .pgpass in the user's 
home directory.  The user running this script should match a postgres user.
Example .pgpass file:

#username and pass must match a postgres user and the user running this script
localhost:*:*:postgres:yourPassword 

When the script completes it will write to a logfile and touch the file called '.last_backup'
located in the backup directory. This file can be used by monit or other system monitoring
programs to gauge backup success.

This script can save a record in a labkey list the job completes.  This requires
several steps:

Authentication to LabKey is handled using a file names .netrc located in the user's
home directory.  The user running this script should match a postgres user.  The
machine in the netrc file should match the domain of your labkey URL.
NOTE: Crypt::SSLeay or Net::SSLeay required for HTTPS

Example .netrc file:

machine labkey.com
login backup_user@wisc.edu 
password yourPassword

To save a log in labkey, you must also create a list in labkey with the following fields:

JobName (string)
Status (string)
Date (datetime)
Log (multiline)
 
You must also include a [lk_config] section in the INI file.  Below is an example INI
file with comments explaining each line.

[general]
compress = 1							;0 or 1.  determines whether DB dumps are compressed
pg_dbname = labkey           			;name of postgres schema(s).  separate multiple schemas with whitespace (ie. 'labkey postgres').  the name 'globals' can be used to run pg_dumpall to backup global items
pgdump_format = c           			;format used by pgdump.  see pgdump doc.  
pg_host = someserver.com	 			;the postgres host.  can be omitted if running on the same server
pg_user = labkey						;user connecting to postgres. can be omitted if using IDENT or other form of authentication
backupdir = /labkey/backup/  			;the directory where backups will be stored
pgdump_dir = /opt/PostgreSQL/8.4/bin/	;the location of pg_dump 
file_root = /labkey/files/				;optional. a folder to be copied to the backupdir. for example the site root

[lk_config]                            ;Section Optional.  
jobName = LK Daily Backup	 		   ;optional. will appear in logfile
baseURL= http://localhost:8080/labkey/ ;url of your server
containerPath = Project/Folder1/	   ;the containerPath where your list is located
schemaName = lists                     ;schema where list is located
queryName = backup	                   ;name of the list itself

[file_rotation]		;can be omited, which will use defaults
maxDaily = 7		;maximum daily backups to keep.  default: 7
maxWeekly = 5		;maximum daily backups to keep.  default: 5
maxMonthly = 100	;maximum daily backups to keep.  default: 0 


=cut



#should be included with perl install
use strict;
#use Net::SMTP;
use Time::localtime;
use FileHandle;
use File::Spec;        
use File::Basename;	 
use File::Copy;
use Config::Abstract::Ini;
use Archive::Tar;
use Log::Rolling;
use Data::Dumper;
use Labkey::Query;
use File::Touch;
 

# get INI file.  this should allow a filepath relative to this script
my @fileparse = fileparse($0, qr/\.[^.]*/);
my $settings = new Config::Abstract::Ini(File::Spec->catfile($fileparse[1],'lkbackup.ini'));

my %config = $settings->get_entry('general');
my %lk_config = $settings->get_entry('lk_config');
my %rotation = $settings->get_entry('file_rotation');

# Variables 
my ($day, $month, $year, $hr, $min, $path, $status);

# Find today's date to append to filenames
my $tm = localtime;
my $datestr=sprintf("%04d%02d%02d_%02d%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);

# make sure the destination folder exists 
checkFolder($config{backupdir});

my $log = Log::Rolling->new(
	log_file => $config{backupdir}."lk_backup.log", 
	max_size=>5000
);

$log->entry("Backup is starting");

if (!-e $config{backupdir}){
	onExit("Unable to create backup directory");	
}

#check required params
my @required = qw(backupdir pgdump_dir);
foreach (@required){
	if (!$config{$_}){
		$log->entry("Missing param: $_ from INI file");	
		onExit("Improper INI file");
	}	 
}	

	
#the postgres backup
checkFolder($config{backupdir} . "database/");
my @dbs = split(/\s/, $config{pg_dbname});
foreach(@dbs){
	runPgBackup($_);
}


#rsync
if($config{file_root}){
	my $dest = $config{backupdir} . "files/";
	checkFolder($dest);
	_rsync($config{file_root}, $dest);
}

onExit("Success", 1);


=item runPgBackup(database)

runPgBackup() is the main sub to backup each database

=cut

sub runPgBackup
{	
	my $db = shift;
	
	my $file_prefix = $db."_";
	my $pg_filename = $file_prefix . $datestr . ".tar";
	
	my $backupdir = File::Spec->catfile($config{backupdir}, "database");
	
	$log->entry("Starting pg_dump of: $db");
			
	#run pg_dump and store in the daily backup folder
	$path = $backupdir."/daily/";
	checkFolder($path);

	my $dailyBackupFile = $path.$pg_filename;
	if($db eq 'globals'){
		_pg_dumpall($dailyBackupFile, $db);
	}
	else {
		_pg_dump($dailyBackupFile, $db);
	}
	
	if ($config{compress}){
		$log->entry("Compressing file: $dailyBackupFile");
		$dailyBackupFile = _compressFile($dailyBackupFile, 1);
	}
	
	#rotate daily backups	
	$rotation{'maxDaily'} ||= 7;
	_rotateFiles($path, $rotation{'maxDaily'}, $file_prefix);		
		
	#add/rotate weekly backups on saturday
	if ($tm->wday == 6 && $rotation{'maxWeekly'} > 0)
		{		
			$path = $backupdir."/weekly/";
			checkFolder($path);		
			my $weeklyFile = $dailyBackupFile ;
			$weeklyFile =~ s/daily/weekly/;
			copy($dailyBackupFile,$weeklyFile ) or onExit("Weekly Pgsql File Copy failed: $!");
			$rotation{'maxWeekly'} ||= 5;
			_rotateFiles($path, $rotation{'maxWeekly'}, $file_prefix);
		}
	
	#add monthly backups on the 1st of the month.  
	if ($tm->mday == 1 && $rotation{'maxMonthly'} > 0)
		{
			$path = $backupdir."/monthly/";
			checkFolder($path);
			copy($dailyBackupFile,$path.$pg_filename) or onExit("Monthly Pgsql File Copy failed: $!");
			_rotateFiles($path, $rotation{'maxMonthly'}, $file_prefix);
		}	
		
	$log->entry("Backup of $db was successful");
}

	
=item onExit(string message, status)

onExit() will log the given message and die.

=cut

sub onExit
{
	my $msg = shift;
	my $code = shift;
	
	if (!$code || $code != 1)
	{
		$status = "Error";	
	}
	else 
	{
		$status = "Success";
	}
	
	$log->entry($msg);
	
	# Insert a record into a labkey list
	if (%lk_config)
	{
		lk_log();
	}
	
	# Write Log messages to log file 
	$log->commit;

	# touch a file to indicate success.  can be used /w monit
	if ($status eq "Success"){
		touch($config{backupdir}.".last_backup");
	}
	
			
	exit $msg;
}


=item checkFolder($folder)

checkFolder() will check whether the $folder exists and create any needed subfolders

=cut

sub checkFolder 
{
	my $folder = shift;

	if (!-d $folder)
	{
		mkdir($folder) || onExit "Could not create '" . $folder . "'";
	chmod 0700,		
	}
	
}

=item _pg_dump($bkpostgresfile, $pg_dbname)

_pg_dump() will backup the schema defined by $pg_dbname into the file specified by $bkpostgresfile 

=cut

sub _pg_dump
{
	my $bkpostgresfile = shift;
	my $pg_dbname = shift;
	
	# Postgres Backup
	my $cmd = $config{pgdump_dir} . "pg_dump -F ".($config{pgdump_format} ? $config{pgdump_format} : 't')." " . ($config{pg_host} ? " -U ".$config{pg_host}." " : "") . $pg_dbname . " -f ".$bkpostgresfile;
	$cmd .= " -h ".$config{pg_host} if $config{pg_host};
	 
	my $pgout = system($cmd . " 2>&1");
	$log->entry($cmd);
	if( $? ){
	    $log->entry("ERROR: Database backup of $pg_dbname has returned an error: $pgout");

	    onExit("Postgres Error: $pgout");
	}
	else{
	    my $tm1 = localtime;
	    $log->entry("pg_dump of $pg_dbname complete");
	}
	
}


=item _pg_dumpall($bkpostgresfile)

_pg_dumpall() will backup global settings into the file specified by $bkpostgresfile 

=cut

sub _pg_dumpall
{
	my $bkpostgresfile = shift;
	
	# Postgres Backup
	my $cmd = $config{pgdump_dir} . "pg_dumpall -g " . ($config{pg_host} ? " -U ".$config{pg_host}." " : "") . " -f ".$bkpostgresfile;
	$cmd .= " -h ".$config{pg_host} if $config{pg_host};
	 
	my $pgout = system($cmd . " 2>&1");
	$log->entry($cmd);
	if( $? ){
	    $log->entry("ERROR: pg_dumpall has returned an error: $pgout");

	    onExit("Postgres Error: $pgout");
	}
	else{
	    my $tm1 = localtime;
	    $log->entry("pg_dumpall of globals complete");
	}
	
}

=item _compressFile(fileName, deleteOrig)

_compressFile() will compress the specified file.  

=cut

sub _compressFile
{
	my $origFile = shift;
	my $newFile = $origFile;
	my $deleteOrig = shift || 0;

	my $archive;
	if ($^O eq "MacOS" || $^O eq 'linux' || $^O eq "darwin") {
		my $archive = system("gzip $origFile 2>&1");
		if( $? ){
			$log->entry("ERROR: Compression returned an error: $archive");
		    onExit("Compression Error: $archive");
		}
		$newFile .= '.gz';			
	}
	elsif ($^O eq 'MSWin32'){
		#this is really, really slow.  if you actually run this on a PC you should replace this with a system command
		my $archive = Archive::Tar->create_archive( $origFile.'.gz', COMPRESS_GZIP, $origFile );	
		
		if( !$archive ){
		    $log->entry("ERROR: Compression returned an error:");
		    $log->entry($archive->error);
	
		    onExit("Compression Error: ".$archive->error);
		}
		$newFile .= '.gz';	
	}
	else {
		onExit("Unrecognized OS: $^O");
	}
	
    $log->entry("Compression complete");
    
    if ($deleteOrig == 1){
    	unlink $origFile;
    }
    return $newFile;
		
}


=item _rotateFiles(directory, maxFiles, filePrefix)

_rotateFiles() will delete all files older than the 'maxFiles' with the given 'filePrefix'
in the specified 'directory'.

=cut

sub _rotateFiles
{
	my $dir = shift;
	my $maxFiles = shift;
	my $filePrefix = shift;
	if (!$maxFiles){return 1;}

	# Must be a directory.
	unless ( -d $dir )
	{
		my $msg = (-e _ ? "$dir: not a directory" : "$dir: does not exist");
		$log->entry($msg);
		onExit($msg);
	}

	# We need write access since we are going to delete files.
	unless ( -w _ )
	{
		$log->entry("$dir: no write access");
		onExit("$dir: no write access");
	}

	# We need read acces since we are going to get the file list.
	unless ( -r _ )
	{
		$log->entry("$dir: no read access");
		onExit("$dir: no read access");
	}

	# Probably need this.
	unless ( -x _ )
	{
		$log->entry("$dir: no access");
		onExit("$dir: no access");
	}

	# Gather file names and ages.
	opendir( DIR, $dir ) or onExit("dir: $!");

	my @files;
	foreach ( readdir(DIR) )
	{
		next if /^\./;
		#limit to files matching this prefix in case other files are stored here
		next unless /^$filePrefix/;
		next unless -f File::Spec->catfile( $dir, $_ );
		push( @files, [ File::Spec->catfile( $dir, $_ ), -M _ ] );
	}
	closedir(DIR);

	$log->entry("$dir: total of " . scalar(@files) . " files");
	
	# Complete if file count below max
	if ( @files <= abs($maxFiles) )
	{
 		$log->entry("$dir: not rotated, below max limit");
		return 1;
	}

	# Sort on age. Also reduces the list to file names only.
	my @sorted = map { $_->[0] } sort { $b->[1] <=> $a->[1] } @files;

	# Splice out the files to keep.
	if ( $maxFiles < 0 )
	{
		# Keep the oldest files (head of the list).
		splice( @sorted, 0, -$maxFiles );
	}
	else
	{
		# Keep the newest files (tail of the list).
		splice( @sorted, @sorted - $maxFiles, $maxFiles );
	}

	# Remove the rest.
	foreach (@sorted)
	{
		my $r = ( !-e $_ ) * 2 || unlink $_;

		if ( $r == 0 )
		{
			onExit("Could not remove $_: $!");
		}
	}
	return 1;
}


=item lk_log()

lk_log() will add a record to the specified labkey list summarizing the backup status

=cut

sub lk_log

{	
	my $date = sprintf("%04d-%02d-%02d %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
	my $insert = Labkey::Query::insertRows(
		-baseUrl => $lk_config{'baseURL'},
		-containerPath => $lk_config{'containerPath'},
		-schemaName => $lk_config{'schemaName'},
 		-queryName => $lk_config{'queryName'},
		-rows => [{"JobName" => $lk_config{'jobName'}, "Status" => $status, "Log" => '', "Date" => $date}]
		);			
 		 	
	
}

=item _rsync()

_rsync() will run rsync for the purposes of backing up the labkey file root

=cut

sub _rsync
{
	my $source = shift;
	my $dest = shift;
	my $log_file = $config{backupdir} . "rsync.log";
print $log_file;
	# Postgres Backup
	my $cmd = "rsync --executability --recursive --links --perms --times --delete --log-file='$log_file' $source $dest";

	my $output = system($cmd . " 2>&1");
	$log->entry($cmd);
	if( $? ){
	    $log->entry("ERROR: Rsync returned an error: $output");

	    onExit("Rsync Error: $output");
	}
	else{
	    $log->entry("rsync operation complete");
	}
}


1;
