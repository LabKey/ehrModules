#!/usr/bin/perl

use strict;
use File::Spec;
use File::Copy;
use File::Basename;

#a very crude script to standardize code across all EHR validation scripts...
# this was used because validation scripts supported includes, and can be depreciated

# this should allow a filepath relative to this script
my @fileparse = fileparse($0, qr/\.[^.]*/);
my $folder = dirname($fileparse[1]);


my $sharedFile = File::Spec->catfile($folder, 'webapp', 'ehr', 'validation.js');
open(SHARED, $sharedFile) || die("Could not open file!");
my @sharedCode = <SHARED>;
my $sharedCode = join("", @sharedCode);
#print "@sharedCode";
close SHARED;

#find the JS files:
my @files;
my $scriptDir = File::Spec->catfile($folder, 'resources', 'queries', 'study');
opendir( DIR, $scriptDir ) or print "error: $!";
foreach ( readdir(DIR) )
{
    next if /^\./;
    #limit to files matching this prefix in case other files are stored here
    next unless /.js$/;
    push( @files, $_);
}
closedir(DIR);
#print "@files";

foreach (@files){
	#backup the old script first
	my $backupDir = File::Spec->catfile($folder, 'webapp', 'ehr', 'backup');
	mkdir($backupDir) unless -e $backupDir;	
	copy(File::Spec->catfile($scriptDir,$_), File::Spec->catfile($backupDir,$_.".bk"))
		|| die "Unable to copy file";
	
	open(SCRIPT, '+<', File::Spec->catfile($scriptDir,$_)) || die("Could not open file!");	
	my @contents = <SCRIPT>;
	my $c = join('', @contents);
	close SCRIPT;

	#replace the code between the '//==includeStart' and '//==includeEnd' tags
	$c =~ s/(?<=\/\/==includeStart)(.*)(?=\/\/==includeEnd)/\n$sharedCode\n/sg;

	#kinda ugly, but we replace the whole file	
	#not sure how subversion will like this
	if ($c){
		#print $c;
		open(SCRIPT, ">", File::Spec->catfile($scriptDir,$_)) || die("Could not open file!");
		print SCRIPT $c || die "error: $!";	
		close SCRIPT;
	} 
	else {
		print 'Tags not found for file: $_\n';
	}
	#die;
}