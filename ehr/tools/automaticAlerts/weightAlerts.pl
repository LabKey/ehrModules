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
my @email_recipients = qw("bimber@wisc.edu");
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
my $datestr=sprintf("%04d-%02d-%02d at %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
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

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.calculated_status~eq=Alive&query.Id/MostRecentWeight/MostRecentWeightDate~isblank"."'>Click here to view these animals</a></p>";
    $email_html .= '<hr>';
}


#then we find all weight drops of >10% in the past 30 days
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'weightRelChange',
    -viewName => '10 Pct Drop In Last 30 Days'
    #-debug => 1,
);

$email_html .= "<b>Weight drops of >10% in the past 30 days:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no weight drops during this period.<hr>";	
}		
else {	
	my %ids;
    foreach my $row (@{$results->{rows}}){
    	$ids{$row->{'Id'}} = 1;
        #$email_html .= $row->{'Id'}."<br>";
    };
    $email_html .= join("<br>", sort(keys %ids))."<br>";

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=weightRelChange&query.viewName=10 Pct Drop In Last 30 Days"."'>Click here to view these animals</a></p>";
    $email_html .= '<hr>';
}


#first we find all weight drops of >10% in the past 90 days
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'weightRelChange',
    -viewName => '10 Pct Drop In Last 90 Days'
    #-debug => 1,
);

$email_html .= "<b>Weight drops of >10% in the past 90 days:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no weight drops during this period.<hr>";	
}		
else {	
	my %ids;
    foreach my $row (@{$results->{rows}}){
    	$ids{$row->{'Id'}} = 1;
        #$email_html .= $row->{'Id'}."<br>";
    };
    $email_html .= join("<br>", sort(keys %ids))."<br>";

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=weightRelChange&query.viewName=10 Pct Drop In Last 90 Days"."'>Click here to view these animals</a></p>";
    $email_html .= '<hr>';
}


#first we find all weight drops of >10% in the past 6 months
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'weightRelChange',
    -viewName => '10 Pct Drop In Last 6 Months'
    #-debug => 1,
);

$email_html .= "<b>Weight drops of >10% in the past 6 months:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no weight drops during this period.<hr>";	
}		
else {	
	my %ids;
    foreach my $row (@{$results->{rows}}){
    	$ids{$row->{'Id'}} = 1;
        #$email_html .= $row->{'Id'}."<br>";
    };
    $email_html .= join("<br>", sort(keys %ids))."<br>";

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=weightRelChange&query.viewName=10 Pct Drop In Last 6 Months"."'>Click here to view these animals</a></p>";
    $email_html .= '<hr>';
}


print "\n\n".$email_html."\n\n";


my $smtp = Net::SMTP->new($mail_server,
    Timeout => 30,
    Debug   => 0,
);

$smtp->mail( $from );
$smtp->recipient(@email_recipients, { Notify => ['FAILURE'], SkipBad => 1 });  

$smtp->data();
$smtp->datasend("Subject: Weight Drops: $datestr\n");
$smtp->datasend("Content-Transfer-Encoding: US-ASCII\n");
$smtp->datasend("Content-Type: text/html; charset=\"US-ASCII\" \n");
$smtp->datasend("\n");
$smtp->datasend($email_html);
$smtp->dataend();

$smtp->quit;


