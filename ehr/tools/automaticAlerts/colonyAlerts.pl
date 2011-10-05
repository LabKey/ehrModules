#!/usr/local/bin/perl

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
my @email_recipients = qw(bimber@wisc.edu colrecords@primate.wisc.edu);
#@email_recipients = qw(bimber@wisc.edu);
my $mail_server = 'smtp.primate.wisc.edu';

#emails will be sent from this address
my $from = 'ehr-no-not-reply@primate.wisc.edu';


############Do not edit below this line
use strict;
use warnings;
use Labkey::Query;
use Net::SMTP;
use MIME::Lite;
use Data::Dumper;
use Time::localtime;
use File::Touch;
use File::Spec;
use File::Basename;
use Cwd 'abs_path';

# Find today's date
my $tm = localtime;
my $datetimestr=sprintf("%04d-%02d-%02d at %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
my $datestr=sprintf("%04d-%02d-%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday);

my $yesterday = localtime( ( time() - ( 24 * 60 * 60 ) ) );
$yesterday = sprintf("%04d-%02d-%02d", $yesterday->year+1900, ($yesterday->mon)+1, $yesterday->mday);

my $tomorrow = localtime( ( time() + ( 24 * 60 * 60 ) ) );
$tomorrow = sprintf("%04d-%02d-%02d", $tomorrow->year+1900, ($tomorrow->mon)+1, $tomorrow->mday);


my $email_html = "This email contains a series of automatic alerts about the WNPRC colony.  It was run on: $datetimestr.<p>";
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


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following animals do not have a weight:</b><br>";

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


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following cages have animals, but do not have known dimensions:</b><br>";
		
    foreach my $row (@{$results->{rows}}){   	
        $email_html .= $row->{'room'}."/".$row->{'cage'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=missingCages"."'>Click here to view the problem cages</a></p>\n";
    $email_html .= "<a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr_lookups&query.queryName=cage"."'>Click here to edit the cage list and fix the problem</a></p>\n";

    $email_html .= '<hr>';
}

#then we list all animals in pc:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Housing',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'eq', 'Alive'],
    	['cond', 'eq', 'pc'],
    	['enddate', 'isblank', ''],
    ],      
    #-debug => 1,
);


if(@{$results->{rows}}){	
	my $map = {};
    my $tempHTML = '';

    foreach my $row (@{$results->{rows}}){   	
        
        if(!$$map{$row->{'room'}}){
			$$map{$row->{'room'}} = {};        	
        } 
        
        my $cage = $row->{'cage'};
        if ($cage =~ /^\d+$/ ){
        	$cage = $cage + 0; #convert to number
        	$$map{$row->{'room'}}{$cage} = [] unless $$map{$row->{'room'}}{$cage};
        	push(@{$$map{$row->{'room'}}{$cage}}, $row->{'Id'}); 	
        }
    };
    
    foreach my $room (sort keys %$map){
    	my $roommap = $$map{$room};
    	foreach my $cage (sort keys %$roommap){
    		if(!$$roommap{$cage - 1} && !$$roommap{$cage + 1}){
    			$tempHTML .= join(';', @{$$roommap{$cage}}).': '.$room."/".$cage."<br>";		
    		}     		 			
    	}
    }

	if($tempHTML){
		$email_html .= "<b>WARNING: The following animals are listed in protected contact, but do not appear to have an adjacent pc animal:</b><br>".$tempHTML;		
	    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Housing&query.cond~eq=pc&query.enddate~isblank="."'>Click here to view all pc animals</a></p>\n";
    	$email_html .= '<hr>';
	}
}


#then we find all living animals with multiple active housing records:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'housingProblems',
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with multiple active housing records:</b><br>";
	
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


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals where the housing snapshot doesnt match the housing table.  The snapshot has been automatically refreshed:</b><br>";	
    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=ValidateHousingSnapshot"."'>Click here to view the report again</a></p>\n";
    $email_html .= '<hr>';
    
    system("/usr/local/labkey/tools/updateSnapshot.pl");
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


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records with potential condition problems:</b><br>";

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


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active housing records where the animal is not alive:</b><br>";
	
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
    	
	#$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Housing&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
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


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." living animals without an active housing record:</b><br>";
		
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
    	
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.Id/curLocation/room~isblank&query.Id/Dataset/Demographics/calculated_status~eq=Alive"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#then we find all records with problems in the calculated_status field
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Validate_status',
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with problems in the status field:</b><br>";
	
	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Validate_status'>Click here to view these records</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Demographics&query.Id~in=".join(';', @ids)."'>Click here to edit demographics to fix the problems</a><p>";
    $email_html .= "<hr>";
}


#then we find all records with problems in the calculated_status field
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Validate_status_mysql',
    #-debug => 1,
);

if(@{$results->{rows}}){
	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with potential problems in the status field (based on old system).</b><br>";
    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Validate_status_mysql'>Click here to view these records</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Demographics&query.Id~in=".join(';', @ids)."'>Click here to edit demographics to fix the problems</a><p>";
    $email_html .= "<hr>";
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


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." living animals without any active assignments:</b><br>";
	
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

#we find any duplicate active assignments
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'duplicateAssignments',
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals double assigned to the same project.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=duplicateAssignments"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}




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

#we find TB records lacking a results more than 30 days old, but less than 90
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'TB Tests',
    -filterArray => [
        ['missingresults', 'eq', 'true'],
        ['date', 'dategte', '-90d'],
        ['date', 'datelte', '-10d'],
    ],
    #-debug => 1,
);


if(@{$results->{rows}}){
	
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." TB Tests in the past 10-90 days that are missing results.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=TB Tests&query.date~datelte=-10d&query.date~dategte=-90d&query.missingresults~eq=true"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";	
}



#we find protocols nearing the animal limit
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'protocolTotalAnimalsBySpecies',
    -filterArray => [
        ['TotalRemaining', 'lt', '5'],
    ],
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." protocols with fewer than 5 remaining animals.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.TotalRemaining~lt=5'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";	
}

#we find protocols nearing the animal limit
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'protocolTotalAnimalsBySpecies',
    -filterArray => [
        ['PercentUsed', 'gte', '95'],
    ],
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." protocols with fewer than 5% of their animals remaining.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.PercentUsed~gte=95'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";	
}


#we find birth records without a corresponding demographics record
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Birth',
    -filterArray => [
    	['Id/Dataset/Demographics/Id', 'isblank', '']	 	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." WNPRC birth records without a corresponding demographics record.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Birth&query.Id/Dataset/Demographics/Id~isblank"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find death records without a corresponding demographics record
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Deaths',
    -filterArray => [
    	['Id/Dataset/Demographics/Id', 'isblank', ''],
    	['notAtCenter', 'neqornull', 'true'] 	 	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." WNPRC death records without a corresponding demographics record.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Deaths&query.Id/Dataset/Demographics/Id~isblank&query.notAtCenter~neqornull=true"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find animals with hold codes, but not on pending 
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',    
    -filterArray => [
    	['hold', 'isnonblank', ''],
		['Id/activeAssignments/NumPendingAssignments', 'eq', 0],    	 	 	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with a hold code, but not on the pending project.</b><br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}." (".$row->{'hold'}.")<br>";
    };
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.hold~isnonblank&query.Id/activeAssignments/NumPendingAssignments~eq=0"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find assignments with projected releases today 
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',    
    -filterArray => [
    	['projectedRelease', 'dateeq', $datestr],
    	['enddate', 'isnonblank', ''],    	 	 	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>ALERT: There are ".@{$results->{rows}}." assignments with a projected release date for today that have not already been ended.</b><br>";

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.projectedRelease~dateeq=$datestr&query.enddate~isnonblank="."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#we find assignments with projected releases tomorrow 
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',    
    -filterArray => [
    	['projectedRelease', 'dateeq', $tomorrow],    	 	 	
    ],    
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>ALERT: There are ".@{$results->{rows}}." assignments with a projected release date for tomorrow.</b><br>";

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.projectedRelease~dateeq=$tomorrow"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#summarize events in last 5 days:
my $mindate = localtime( ( time() - ( 5 * 24 * 60 * 60 ) ) );
$mindate = sprintf("%04d-%02d-%02d", $mindate->year+1900, ($mindate->mon)+1, $mindate->mday);
$email_html .= "<b>Colony events in the past 5 days:</b><p>";


#births in the last 5 days:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Birth',
    -filterArray => [
    	['date', 'dategte', $mindate] 	
    ],    
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "Births since $mindate:<br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Birth&query.date~dategte=$mindate"."'>Click here to view them</a><br>\n";
#    $email_html .= '<hr>';
}


#deaths in the last 5 days:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Deaths',
    -filterArray => [
    	['date', 'dategte', $mindate] 	
    ],    
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "Deaths since $mindate:<br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Deaths&query.date~dategte=$mindate"."'>Click here to view them</a><br>\n";
    #$email_html .= '<hr>';
}

#prenatal deaths in the last 5 days:
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Prenatal Deaths',
    -filterArray => [
    	['date', 'dategte', $mindate]
    ],
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "Prenatal Deaths since $mindate:<br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.date~dategte=$mindate"."'>Click here to view them</a><br>\n";
    #$email_html .= '<hr>';
}

$email_html .= '<hr>';



#find the total finalized records with future dates 
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'StudyData',
    -filterArray => [
        ['qcstate/PublicData', 'eq', 'true'],
        ['date', 'dategt', $datestr],
    ],
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." finalized records with future dates.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=StudyData&query.date~dategt=$datestr&query.qcstate/PublicData~eq=true'>Click here to view them</a><br>\n";
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
#die;


my $smtp = MIME::Lite->new(
          To      =>join(", ", @email_recipients),
          From    =>$from,
          Subject =>"Subject: Daily Colony Alerts: $datestr",
          Type    =>'multipart/alternative'
          );
$smtp->attach(Type => 'text/html',
          Encoding => 'quoted-printable',
          Data	 => $email_html
);         
$smtp->send() || die;

touch(File::Spec->catfile(dirname(abs_path($0)), '.colonyAlertsLastRun'));
