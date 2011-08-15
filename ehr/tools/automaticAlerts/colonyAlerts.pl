#!/usr/bin/perl

=head1 DESCRIPTION

This script is designed to run as a cron job.  It will query a number of tables an email a report.
The report is designed to identify potential problems with the colony, primarily related to weights, housing
and assignments.


=head1 LICENSE

This package and its accompanying libraries are free software; you can
redistribute it and/or modify it under the terms of the GPL (either
version 1, or at your option, any later version) or the Artistic
License 2.0.

=head1 AUTHOR

Ben Bimber

=cut

#config options:
my $baseUrl = 'https://ehr.primate.wisc.edu/';
my $studyContainer = 'WNPRC/EHR/';

#whitespace separated list of emails
my @am_email_recipients = qw(bimber@wisc.edu frost@primate.wisc.edu friscino@primate.wisc.edu colrecords@primate.wisc.edu);
my @pm_email_recipients = qw(bimber@wisc.edu);
my $mail_server = 'smtp.primate.wisc.edu';

#emails will be sent from this address
my $from = 'ehr-no-not-reply@primate.wisc.edu';


############Do not edit below this line
use strict;
use warnings;
use Labkey::Query;
use Net::SMTP;
use Data::Dumper;
use Time::localtime;

# Find today's date
my $tm = localtime;
my $datestr = sprintf("%04d-%02d-%02d at %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);

my $yesterday = localtime( ( time() - ( 24 * 60 * 60 ) ) );
$yesterday = sprintf("%04d-%02d-%02d", $yesterday->year+1900, ($yesterday->mon)+1, $yesterday->mday);

my $email_html = "This email contains a series of automatic alerts about the WNPRC colony.  It was run on: $datestr.<p>";
my $results;

#first we find all living animals without a weight:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -filterArray => [
        ['calculated_status', 'eq', 'Alive'],
        ['Id/MostRecentWeight/MostRecentWeightDate', 'isblank', ''],
    ],
    #-debug => 1,
);

$email_html .= "<b>Living animals without a weight:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no living animals without a weight.<hr>";	
}		
else {	
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.calculated_status~eq=Alive&query.Id/MostRecentWeight/MostRecentWeightDate~isblank"."'>Click here to view these animals</a></p>\n";
    $email_html .= '<hr>';
}


#then we find all occupied cages without dimensions:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'missingCages',
    #-debug => 1,
);

$email_html .= "<b>Cages with animals, but without known dimensions:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "All occupied cages are ok.<hr>";	
}		
else {	    
    foreach my $row (@{$results->{rows}}){   	
        $email_html .= $row->{'room'}."/".$row->{'cage'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=missingCages"."'>Click here to view the problem cages</a></p>\n";
    $email_html .= "<a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr_lookups&query.queryName=cages"."'>Click here to edit the cage list and fix the problem</a></p>\n";

    $email_html .= '<hr>';
}


#then we find all living animals with multiple active housing records:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'housingProblems',
    #-debug => 1,
);

$email_html .= "<b>Animals with multiple active housing records:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no living animals with multiple active housing records.<hr>";	
}		
else {		
	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=housingProblems"."'>Click here to view these animals</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=".join(';', @ids)."&query.enddate~isblank'>Click here to edit housing to fix the problems</a><p>";
    $email_html .= '<hr>';
}

#then we find all living animals with multiple active housing records:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'ValidateHousingSnapshot',
    #-debug => 1,
);

$email_html .= "<b>Animals where the housing snapshot doesnt match the housing table:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "All animals are ok.<hr>";	
}		
else {		
	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=ValidateHousingSnapshot"."'>Click here to view these animals</a></p>\n";
    $email_html .= '<hr>';
}

#then we find all records with potential housing condition problems
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'housingConditionProblems',
    -viewName => 'Problems',
    #-debug => 1,
);

$email_html .= "<b>Housing records with potential condition problems:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no records with condition problems.<hr>";	
}		
else {		
	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=housingConditionProblems&query.viewName=Problems"."'>Click here to view these records</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=".join(';', @ids)."&query.enddate~isblank'>Click here to edit housing to fix the problems</a><p>";

    #$email_html .= join('<br>', @ids);
    $email_html .= '<hr>';
}

#we find open housing records where the animal is not alive
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Housing',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],    
    #-debug => 1,
);

$email_html .= "<b>Active housing records where the animal is not alive:</b><br>";

if(@{$results->{rows}}){
	
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
    	
	#$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Housing&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}
else {
	$email_html .= "There are no active housing records for non-living animals.<hr>\n";		
}


#we find living animals without an active housing record
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'eq', 'Alive'],
    	['Id/curLocation/room', 'isblank', ''],
    ],    
    #-debug => 1,
);

$email_html .= "<b>Living animals without an active housing record:</b><br>";

if(@{$results->{rows}}){
	
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
    	
	#$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." living animals that lack an active housing record.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.Id/curLocation/room~isblank&query.Id/Dataset/Demographics/calculated_status~eq=Alive"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}
else {
	$email_html .= "There are no living animals without an active housing record.<hr>\n";		
}


#then we find all records with problems in the calculated_status field
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Validate_status',
    #-debug => 1,
);

$email_html .= "<b>Animals with problems in the status field:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no animals with problems in the status field.<hr>";	
}		
else {		
	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Validate_status'>Click here to view these records</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Demographics&query.Id~in=".join(';', @ids)."'>Click here to edit demographics to fix the problems</a><p>";
    $email_html .= "<hr>";
}



#then we find all animals with cage size problems
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'CageReview',
    -viewName => 'Problem Cages',
    #-debug => 1,
);

$email_html .= "<b>Cages that are too small for the animals currently in them:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no cages with problems.<hr>";	
}		
else {		
    foreach my $row (@{$results->{rows}}){ 	
        $email_html .= $row->{'Location'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=CageReview&query.viewName=Problem Cages'>Click here to view these cages</a></p>\n";    
    $email_html .= '<hr>';
}

#then we find all animals lacking any assignments
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -viewName => 'No Active Assignments',
    #-debug => 1,
);

$email_html .= "<b>Living animals without any active assignments:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no animals without assignments.<hr>";	
}		
else {		
	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'Id'});   	
        $email_html .= $row->{'Id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=No Active Assignments'>Click here to view these animals</a></p>\n";    
    $email_html .= '<hr>';
}


#we find any active assignment where the animal is not alive
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active assignments for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}	

#we find any active assignment where the project lacks a valid protocol
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],
		['protocol/protocol', 'isblank', ''],    			    	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active assignments to a project without a valid protocol.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive&query.protocol/protocol~isblank"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#find animals not weighed in the past 60 days
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -filterArray => [
    	['calculated_status', 'eq', 'Alive'],
		['Id/MostRecentWeight/DaysSinceWeight', 'gt', 60],    			    	
    ],    
    #-debug => 1,
);

$email_html .= "<b>Living animals without a weight in the past 60 days:</b><br>";

if(@{$results->{rows}}){	
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
	
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.Id/MostRecentWeight/DaysSinceWeight~gt=60&query.calculated_status~eq=Alive"."'>Click here to view them</a><br>\n";			
}
else {
	$email_html .= "All animals have been weighed in the past 60 days\n";
}

$email_html .= "<hr>\n";

#we find open ended treatments where the animal is not alive
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Treatment Orders',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active treatments for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Treatment Orders&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}	


#we find open ended problems where the animal is not alive
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Problem List',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." unresolved problems for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Problem List&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}	


#we find open assignments where the animal is not alive
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active assignments for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#we print some stats on data entry:

$email_html .= "<b>Data Entry Stats:</b><p>";

$results = Labkey::Query::executeSql(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -sql => "SELECT formtype, count(*) as total FROM ehr.tasks WHERE cast(created as date) = '$yesterday' GROUP BY formtype ORDER BY formtype",    
    #-debug => 1,
);

if(@{$results->{rows}}){	
	$email_html .= "Number of Forms Created Yesterday: <br>\n";
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'formtype'}.": ".$row->{'total'}."<br>\n";
    };
	
	$email_html .= "<p>\n";			
}

$results = Labkey::Query::executeSql(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -sql => "SELECT Dataset.Label as label, count(*) as total FROM study.studydata WHERE cast(created as date) = '$yesterday' and taskid is not null GROUP BY Dataset.Label ORDER BY Dataset.Label",    
    #-debug => 1,
);

if(@{$results->{rows}}){	
	$email_html .= "Number of Records Created Yesterday Through Labkey: <br>\n";
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'label'}.": ".$row->{'total'}."<br>\n";
    };
	
	$email_html .= "<p>\n";			
}

$results = Labkey::Query::executeSql(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -sql => "SELECT DataSet.Label as label, count(*) as total FROM study.studydata WHERE cast(created as date) = '$yesterday' and taskid is null GROUP BY DataSet.Label ORDER BY DataSet.Label",    
    #-debug => 1,
);

if(@{$results->{rows}}){	
	$email_html .= "Number of Records Created Yesterday Through MySQL: <br>\n";
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'label'}.": ".$row->{'total'}."<br>\n";
    };
	
	$email_html .= "<p>\n";			
}


#open(HTML, ">", "C:\\Users\\Admin\\Desktop\\test.html");
#print HTML $email_html;
#close HTML;

my @email_recipients;
if($tm->hour > 12){
	@email_recipients = @pm_email_recipients;	
}
else {
	@email_recipients = @am_email_recipients;
}

my $smtp = Net::SMTP->new($mail_server,
    Timeout => 30,
    Debug   => 0,
);

$smtp->mail( $from );
my @goodrecips=$smtp->recipient(@email_recipients, { Notify => ['FAILURE'], SkipBad => 1 });  
$smtp->data();
$smtp->datasend("Subject: Daily Colony Alerts: $datestr\n");
$smtp->datasend("Content-Type: text/html \n");
$smtp->datasend("\n");
$smtp->datasend($email_html);
$smtp->dataend();
$smtp->quit;


