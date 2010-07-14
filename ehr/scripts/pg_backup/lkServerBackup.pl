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
localhost:5432:*:fedora:fedora 

This script can save a record in a labkey list the job completes.  This requires
several steps:

Authentication to LabKey is handled using a file names .netrc located in the user's
home directory.  The user running this script should match a postgres user.  The
machine in the netrc file should match the domain of your labkey URL.
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
makeTar = 1								;0 or 1.  determines whether DB dumps are compressed
pg_dbname = labkey           			;name of postgres schema(s).  separate multiple schemas with whitespace (ie. 'labkey postgres')
pg_host = someserver.com	 			;the postgres host.  can be omitted in running on the same server
backupdir = /labkey/backup/  			;the directory where backups will be stored
pgdump_dir = /opt/PostgreSQL/8.4/bin/	;the location of pg_dump 

[lk_config]                            ;Section Optional.  
jobName = LK Daily Backup	 		   ;optional. will appear in logfile
baseURL= http://localhost:8080/labkey/ ;url of your server
containerPath = /Folder1			   ;optional. the containerPath where your list is located
project=shared	                       ;name of the project where log list is located
schemaName = lists                     ;schema where list is located
queryName = backup	                   ;name of the list itself

[file_rotation]		;can be omited, which will use defaults
maxDaily = 7		;maximum daily backups to keep.  default: 7
maxWeekly = 5		;maximum daily backups to keep.  default: 5
maxMonthly = 100	;maximum daily backups to keep.  default: all


=cut



#should be included with perl install
use strict;
use Net::SMTP;
use Time::localtime;
use File::Spec;        
use File::Basename;	 
use File::Copy;
use Config::Abstract::Ini;
use Archive::Tar;

#required for labkey API.  can comment out if this is not used
use LWP::UserAgent; 
use HTTP::Request; 
use Net::Netrc;
use JSON;
# Crypt::SSLeay or Net::SSLeay required for HTTPS

# get settings.  this should allow a filepath relative to this script
my @fileparse = fileparse($0, qr/\.[^.]*/);
my $settings = new Config::Abstract::Ini(File::Spec->catfile($fileparse[1],'lkbackup.ini'));

my %config = $settings->get_entry('general');
$config{pg_dbname} ||= 'labkey';
$config{pgdump_dir} ||= "/opt/PostgreSQL/8.4/bin/";

my %lk_config = $settings->get_entry('lk_config');
my %rotation = $settings->get_entry('file_rotation');

	
# Variables 
my ($day, $month, $year, $hr, $min, $log, $path, $status);

# Find today's date to append to filenames
my $tm = localtime;
my $datestr=sprintf("%04d%02d%02d_%02d%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);

# make sure the destination folder exists 
checkFolder($config{backupdir});

if (!-e $config{backupdir}){
	onExit("Unable to create backup directory");	
}

# Open log file and start log entries
my $logfile = $config{backupdir} . "lk_backup.log";
open(LOGFILE, ">>", $logfile) || onExit("Unable to open $logfile");
print LOGFILE "\n";
print LOGFILE "======================================================================= \n";
$log .= "[".sprintf("%02d:%02d %02d/%02d/%04d", $tm->hour, $tm->min, ($tm->mon)+1, $tm->mday, $tm->year+1900)."]: Backup is starting\n";
	
#the postgres backup
checkFolder($config{backupdir} . "database/");
my @dbs = split(/\s/, $config{pg_dbname});
foreach(@dbs){
	runPgBackup($_);
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
	
	$log .= "Starting pg_dump of: $db\n";
			
	#run pg_dump and store in the daily backup folder
	$path = $backupdir."/daily/";
	checkFolder($path);
	
	my $dailyBackupFile = $path.$pg_filename;
	pg_dump($dailyBackupFile, $db);

	$log .= "Compressing file: \n";
	if ($config{makeTar}){
		compressFile($dailyBackupFile, 1);
	}
	
	$dailyBackupFile .= ".gz";
	$pg_filename .= ".gz";
	
	#rotate daily backups	
	$rotation{'maxDaily'} ||= 7;
	rotateFiles($path, $rotation{'maxDaily'}, $file_prefix);		
		
	#add/rotate weekly backups on saturday
	if ($tm->mday == 6 && $rotation{'maxWeekly'} > 0)
		{		
			$path = $backupdir."/weekly/";
			checkFolder($path);
			copy($dailyBackupFile,$path.$pg_filename) or onExit("Weekly Pgsql File Copy failed: $!");
			$rotation{'maxWeekly'} ||= 5;
			rotateFiles($path, $rotation{'maxWeekly'}, $file_prefix);
		}
	
	#add monthly backups on the 1st of the month.  
	if ($tm->mday == 1 && $rotation{'maxMonthly'} > 0)
		{
			$path = $backupdir."/monthly/";
			checkFolder($path);
			copy($dailyBackupFile,$path.$pg_filename) or onExit("Monthly Pgsql File Copy failed: $!");
			$rotation{'maxMonthly'} ||= undef;
			rotateFiles($path, $rotation{'maxMonthly'}, $file_prefix);
		}

	$log .= "DB Backup Successful\n";

}


=item onExit(string message, status)

onExit() will log the given message and die.

=cut

sub onExit
{
	my $msg = shift;
	my $code = shift;
	
	unless ( defined $msg && $msg ne '' )
	{
		$msg = '';
	}

	
	if (!$code || $code != 1)
	{
		$status = "Error";	
	}
	else 
	{
		$status = "Success";
	}
	
	# Insert a record into a labkey list
	if (%lk_config)
	{
		lk_log();
	}
	
	# Write Log messages to log file 
	print LOGFILE $log;
	close LOGFILE;
		
	die $msg;
	return undef;
}


=item checkFolder($folder)

checkFolder() will check whether the $folder exists and create any needed subfolders

=cut

sub checkFolder 
{
	my $folder = shift;

	if (!-d $folder)
	{
		mkdir($folder)
		  || onExit "Could not create '" . $folder . "'";
	chmod 0700,		
	}
	
}

=item pg_dump($bkpostgresfile, $pg_dbname)

pg_dump() will backup the schema defined by $pg_dbname into the file specified by $bkpostgresfile 

=cut

sub pg_dump
{
	my $bkpostgresfile = shift;
	my $pg_dbname = shift;
	
	# Postgres Backup
	my $cmd = $config{pgdump_dir} . "pg_dump -F t " . $pg_dbname . " -f ".$bkpostgresfile;
	$cmd .= " -h ".$config{pg_host} if $config{pg_host};
	 
	my $pgout = system($cmd . " 2>&1");
	if( $? ){
	    $log .="**** Database backup process has returned an error! ****: See output from command below \n\n";
	    $log .="$pgout \n" if $pgout;
	    onExit("Postgres Error: $pgout");
	}
	else{
	    my $tm1 = localtime;
	    $log .= "[".sprintf("%02d:%02d %02d/%02d/%04d", $tm1->hour, $tm1->min, ($tm1->mon)+1, $tm1->mday, $tm1->year+1900)."]: Database backup was a success.\n";
	    $log .="$pgout \n" if $pgout;
	}
	
}


=item makeTar(fileName, deleteOrig)

makeTar() will make a tar file of the specified file.  

=cut

sub compressFile
{
	my $fileName = shift;
	my $deleteOrig = shift || 0;

	my $archive;
	if ($^O eq "MacOS" || $^O eq 'linux' || $^O eq "darwin") {
		my $archive = system("gzip $fileName 2>&1");
		if( $? ){
		    $log .="**** Compression returned an error! ****: See output from command below \n\n";
		    $log .= $archive . " \n";
		    onExit("Compression Error: $archive");
		}			
	}
	elsif ($^O eq 'MSWin32'){
		#this is really, really slow.  if you actually run this on a PC you should replace this with a system command
		my $archive = Archive::Tar->create_archive( $fileName.'.gz', COMPRESS_GZIP, $fileName );	
		
		if( !$archive ){
		    $log .="**** Compression process has returned an error! ****: See output from command below \n\n";
		    $log .= $archive->error . " \n";
	
		    onExit("Compression Error: $archive->error");
		}
	}
	else {
		onExit("Unrecognized OS: $^O");
	}
	
    my $tm1 = localtime;
    $log .= "[".sprintf("%02d:%02d %02d/%02d/%04d", $tm1->hour, $tm1->min, ($tm1->mon)+1, $tm1->mday, $tm1->year+1900)."]: File compressed.\n";
    
    if ($deleteOrig == 1){
    	unlink $fileName;
    }
		
}


=item rotateFiles(directory, maxFiles, filePrefix)

rotateFiles() will delete all files older than the 'maxFiles' with the given 'filePrefix'
in the specified 'directory'.

=cut

sub rotateFiles
{
	my $dir = shift;
	my $maxFiles = shift;
	my $filePrefix = shift;

	if (!$maxFiles){return 1;}

	# Must be a directory.
	unless ( -d $dir )
	{
		my $msg = (-e _ ? "$dir: not a directory" : "$dir: does not exist");
		$log .=  $msg."\n";
		onExit($msg);
	}

	# We need write access since we are going to delete files.
	unless ( -w _ )
	{
		$log .= "$dir: no write access\n";
		onExit("$dir: no write access");
	}

	# We need read acces since we are going to get the file list.
	unless ( -r _ )
	{
		$log .= "$dir: no read access\n";
		onExit("$dir: no read access");
	}

	# Probably need this.
	unless ( -x _ )
	{
		$log .= "$dir: no access\n";
		onExit("$dir: no access");
	}

	# Gather file names and ages.
	opendir( DIR, $dir )
	  or onExit("dir: $!");

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

	$log .= "$dir: total of " . scalar(@files) . " files" . "\n";

	# Complete if file count below max
	if ( @files <= abs($maxFiles) )
	{
		$logfile.= ("$dir: not rotated, below max limit");
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
	my $ua = new LWP::UserAgent; 
	$ua->agent("Perl API Client/1.0");
			
	my $url = $lk_config{'baseURL'} . "query/" . $lk_config{'project'} . ($lk_config{'containerPath'} ? $lk_config{'containerPath'} : '') . "/" . "insertRows.api";
 	#print $url;
 	
	my $date = sprintf("%04d-%02d-%02d %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
	my $data = {
		"schemaName" => $lk_config{'schemaName'},
 		"queryName"=> $lk_config{'queryName'},
 		"rows" => [{"JobName" => $lk_config{'jobName'}, "Status" => $status, "Log" => $log, "Date" => $date}]
		};
		
	my $json_obj = JSON->new->utf8->encode($data);
	#print $json_obj;
	 
	#insert the row	
	my $req = new HTTP::Request;
	$req->method('POST');
	$req->url($url);
	$req->content_type('application/json');
	$req->content($json_obj);
  
	#if no machine supplied, extract domain from baseUrl 
	if (!$lk_config{'machineName'}){
		$lk_config{'machineName'} = URI->new($lk_config{'baseURL'})->host;
	}  
	
	my $mach = Net::Netrc->lookup($lk_config{'machineName'});
	if (!$mach)
	{
		$log .= "\nERROR: netrc either not present or machine name not found\n";
		print "ERROR: netrc either not present or machine name not found\n";
	}	
	else
	{
		$req->authorization_basic($mach->login, $mach->password);
		my $response = $ua->request($req);	
		#print $response->content;				

		if ($response->is_error){
			$log .= "Error Inserting Record: ".$response->status_line . "\n";
			$log .= "$url\n";			
		}

	}
}






1;