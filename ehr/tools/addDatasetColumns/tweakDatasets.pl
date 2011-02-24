#!/usr/bin/perl

=head1 DESCRIPTION

This script is designed to manipulate datasets in LabKey.  It is designed to iterate through each table in the studydataset schema, then will build a SQL string.
This script is designed to add new fields to a dataset using the EHR's shared property descriptors.  It could be modified to accomplish other objectives.


=head1 LICENSE

This package and its accompanying libraries are free software; you can
redistribute it and/or modify it under the terms of the GPL (either
version 1, or at your option, any later version) or the Artistic
License 2.0.

=head1 AUTHOR

Ben Bimber

=cut

use Labkey::Query;
use Data::Dumper;
use File::Spec;
use File::Path qw(make_path);
use Time::localtime;
use File::Copy;
#use DBI;
#use DBD::PgDBI;


# Find today's date to append to filenames
my $tm = localtime;
my $datestr=sprintf("%04d%02d%02d_%02d%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);

my $pg_path = 'C:\Program Files (x86)\PostgreSQL\8.4\bin'; 
my $pg_exe = "$pg_path\\psql.exe";
#$pg_exe = 'psql';

my $user = "labkey";
my $sql = '';
my $container = "29e3860b-02b5-102d-b524-493dbd27b599";
my $expected_columns = {
	account => {
		-propertyURI => 'urn:ehr.labkey.org/#Account',
	},
	project => {
		-propertyURI => 'urn:ehr.labkey.org/#Project',
		-type => 'integer',
	},		
	remark => {
		-propertyURI => 'urn:ehr.labkey.org/#Remark',
	},		
	taskid => {
		-propertyURI => 'urn:ehr.labkey.org/#TaskId',
	},		
	description	 => {
		-propertyURI => 'urn:ehr.labkey.org/#Description',
	},
	parentid => {
		-propertyURI => 'urn:ehr.labkey.org/#ParentId',
	},		
	requestid	 => {
		-propertyURI => 'urn:ehr.labkey.org/#RequestId',
	},
	performedby	 => {
		-propertyURI => 'urn:ehr.labkey.org/#PerformedBy',
	},
	objectid	 => {
		-propertyURI => 'urn:ehr.labkey.org/#ObjectId',
	}			
}; 

my $dataset_hash = {};

my $datasets = runSQL("select tablename from pg_tables where schemaname='studydataset'"); 
foreach my $dataset (grep(/c108/, @$datasets)){
	$dataset =~ s/^\s+//;
	$$dataset_hash{$dataset} = {};
	
	$$dataset_hash{$dataset}{-domainId} = runSQL("select domainid from exp.domaindescriptor where storageschemaname = 'studydataset' and storagetablename = '$dataset'");
	$$dataset_hash{$dataset}{-domainId} = ${$$dataset_hash{$dataset}{-domainId}}[2];
	$$dataset_hash{$dataset}{-domainId} =~ s/^\s+//;

	$$dataset_hash{$dataset}{-sortOrder} = runSQL("select max(sortorder) from exp.propertydomain where domainid='".$$dataset_hash{$dataset}{-domainId}."'");
	$$dataset_hash{$dataset}{-sortOrder} = ${$$dataset_hash{$dataset}{-sortOrder}}[2];
	$$dataset_hash{$dataset}{-sortOrder} =~ s/^\s+//;
		
	#add columns as needed
	my $columns = runSQL("select column_name FROM information_schema.columns WHERE table_name = '$dataset'"); 
	foreach my $col (keys %$expected_columns){
		$sql .= "--$dataset, $col\n";
		my $result = findPropDescriptor($dataset, $col);		
		if(!$result){
			$sql .= "\t--Cannot find property description\n";
		};		
				
		if(!grep(/$col/, @$columns)){			
			addColumn($dataset, $col);
		}
	
		verifyPropDescriptor($dataset, $col);		
	}		
	
	#add index:
#	my $fields_to_index = ['taskid', 'requestid', 'parentid', 'objectid'];
#	foreach my $fn (@$fields_to_index){
#		$sql .= "DROP INDEX IF EXISTS studydataset.".$dataset."_$fn;\n";
#		$sql .= "CREATE INDEX ".$dataset."_$fn ON studydataset.$dataset USING btree ($fn);\n";
#	}	
}

#make sure all non-demographics datasets use GUID / objectId
$sql .= "UPDATE study.dataset SET keymanagementtype='GUID', keypropertyname='objectid' WHERE demographicdata=FALSE;\n";
print $sql."\n";


sub findPropDescriptor {
	my ($dataset, $col)	= @_;

	if(!$$expected_columns{$col}{-propertyId}){	
		$$expected_columns{$col}{-propertyId} = runSQL("select propertyid from exp.propertydescriptor where propertyuri='".$$expected_columns{$col}{-propertyURI}."'");
		$$expected_columns{$col}{-propertyId} = ${$$expected_columns{$col}{-propertyId}}[2];
		$$expected_columns{$col}{-propertyId} =~ s/^\s+//;
	}
	
	if($$expected_columns{$col}{-propertyId} =~ m/row/){
		print "ERROR: propertydescriptor not found $col\n";
		return 0;
	}
	else {
		return 1;
	}
}

sub addColumn {
	my ($dataset, $col)	= @_;		
	$sql .= "ALTER table studydataset.$dataset ADD column $col ".($$expected_columns{$col}{-type} || 'character varying(4000)').";\n";
}

sub verifyPropDescriptor {
	my ($dataset, $col)	= @_;
	my $result = runSQL("select propertyid from exp.propertydomain p where domainId=".$$dataset_hash{$dataset}{-domainId}." AND propertyid in (select propertyid from exp.propertydescriptor pd where pd.name ilike '%$col%')");
	my $count = @$result - 3;	
	my $oldId = [];
	my $hasProperty;
	
	for(my $i=2;$i<@$result-1;$i++){
		my $item = ${$result}[$i];
		$item =~ s/^\s+//;		
		if($item == $$expected_columns{$col}{-propertyId}){
			$hasProperty = 1;
		}
		else {
			push(@$oldId, $item);
		}				
	}		
	$oldId = join(",", @$oldId);

	if(!$count){
		#this means we're adding the column for the first time
		$$dataset_hash{$dataset}{-sortOrder}++;	
		$sql .= "INSERT INTO exp.propertydomain (propertyid, domainid, required, sortorder) VALUES (".$$expected_columns{$col}{-propertyId}.", ".$$dataset_hash{$dataset}{-domainId}.", 'f', (select max(sortorder)+1 FROM exp.propertydomain where domainid=".$$dataset_hash{$dataset}{-domainId}."));\n";
		return;				 
	}		

	if($hasProperty){
		$sql .= "\t--Record already exists in exp.propertydomain\n";
		if($count > 1){				
			$sql .= "DELETE FROM exp.propertydomain WHERE propertyid!=".$$expected_columns{$col}{-propertyId}." AND domainId=".$$dataset_hash{$dataset}{-domainId}." AND propertyid IN ($oldId);\n";
		}
		return;
	}	
	
	if ($count == 1) {
		$sql .= "UPDATE exp.propertydomain SET propertyid=".$$expected_columns{$col}{-propertyId}." where domainId=".$$dataset_hash{$dataset}{-domainId}." AND propertyid IN ($oldId);\n";
	}		 			
	else {
		#if more than 1 row exists, this means we have duplicate property descriptors
		my $min_sort = runSQL("select min(sortorder) from exp.propertydomain p where domainId=".$$dataset_hash{$dataset}{-domainId}." AND propertyid in (select propertyid from exp.propertydescriptor pd where pd.name ilike '%$col%')");
		$min_sort = ${$min_sort}[2];
		$sql .= "--\tsort order: ".$min_sort."\n";
		
		$sql .= "UPDATE exp.propertydomain SET propertyid=".$$expected_columns{$col}{-propertyId}." where domainId=".$$dataset_hash{$dataset}{-domainId}." AND propertyid IN ($oldId) AND sortorder=$min_sort;\n";			
		$sql .= "DELETE FROM exp.propertydomain WHERE propertyid!=".$$expected_columns{$col}{-propertyId}." AND domainId=".$$dataset_hash{$dataset}{-domainId}." AND propertyid IN ($oldId) AND sortorder!=$min_sort;\n";										
	}	
}

sub runSQL {
	my $sql= shift;
	my @result = split("\n", `"$pg_exe" -h localhost -U $user -d labkey -c "$sql"`);
	return \@result;
}