#!/usr/bin/perl

use Labkey::Query;
use Data::Dumper;
use File::Spec;
use File::Path qw(make_path);
use Time::localtime;
use File::Copy;

#my $output_dir = '/usr/local/labkey/extracts';
#my $final_dir = '/usr/local/labkey/birn/';
my $output_dir = '/home/fedora/Desktop/labkey/extracts';
my $final_dir = '/home/fedora/Desktop/labkey/birn/';
my $default_container = '/WNPRC/EHR';


make_path($output_dir);
make_path($final_dir);

# Find today's date to append to filenames
my $tm = localtime;
my $datestr=sprintf("%04d%02d%02d_%02d%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);


sub extractTSV {
	my $args = shift;
	my $results = Labkey::Query::selectRows(
		-baseUrl => 'https://xnight.primate.wisc.edu:8443/labkey/',
		-containerPath => $args->{containerPath} || $default_container,
		-schemaName => $args->{schemaName},
		-queryName => $args->{queryName},
		-viewName => $args->{viewName},
		-columns => $args->{columns},	
		-maxRows => 1,		
	);	

	my $file = File::Spec->catfile($output_dir, ($args->{fileName} ? $args->{fileName} : $args->{queryName})."_$datestr.tsv");
	open(OUTPUT, ,">", $file);

	my @fields;
	foreach my $field (@{$results->{metaData}->{fields}}){	
		push(@fields, $field->{name});
	}
	print OUTPUT join("\t", @fields) . "\n";
		
	foreach my $row (@{$results->{rows}}){	
		my @line;						
		foreach (@fields){			
			if ($row->{$_}){
				push(@line, $row->{$_});
			}			
			else {
				push(@line, "");
			}		 			
		}				
		print OUTPUT join("\t", @line);
		print OUTPUT "\n";
	};
		
	close OUTPUT;	
	
	return $file;	
}

my $results = Labkey::Query::selectRows(
	-baseUrl => 'https://xnight.primate.wisc.edu:8443/labkey/',
	-containerPath => '/WNPRC/EHR',
	-schemaName => 'lists',
	-queryName => 'extracts',
#	-debug => 1,		
);	

foreach (@{$results->{rows}}){
    #run API to get records
    my $file = extractTSV($_);

    #run hasher    
    unlink $file.".orig" if (-e $file.".orig");
    
    $_->{fieldsToHash} =~ s/,/ /g;
    my $cmd = "java hasher WNPRC $file ".$_->{fieldsToHash};
    system($cmd);
         
    #copy new file to BIRN
    copy($file, $final_dir);
}
