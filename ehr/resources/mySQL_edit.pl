#! /usr/bin/perl
# 
my @tables = qw(
abstract
arrival
assignment
bacteriology
behavedrug
behavehead
behavetrem
biopsydiag
biopsyhead
birth
blood
bloodgas
cage
cageclass
cagenotes
cases
chemisc
chemisc2
chemistry
chemnorm
clindrug
clinhead
clinpathmisc
clintrem
departure
electrolyte
electrophor
enzyme
files
gtt
hemamisc
hematology
holdcode
hormdrug
hormhead
hormtrem
housing
id
immunohead
immunores
labanimals
lapid
lipid
marmaux
mhctype
monitoranes
monitorfluid
monitorhead
monitormed
monitorsign
necropsydiag
necropsyhead
newsnomed
obs
parahead
parares
pedigree
perdiemrates
prenatal
project
protocol
ref_range
rhesaux
snomap
snomed
surganes
surgfluid
surghead
surgmed
surgpost
surgproc
surgsum
tb
tissue
treatments
urine
virisohead
virisores
virserohead
virserores
weight
);

my $sql = '';

#$sql .= "DROP TABLE IF EXISTS `colony`.`deleted`;
#CREATE TABLE  `colony`.`deleted` (
#  `id` int(10) unsigned NOT NULL auto_increment,
#  `uuid` varchar(45) default NULL,
#  `tableName` varchar(45) default NULL,
#  `ts` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
#  PRIMARY KEY  (`id`)
#);\n
#";

foreach my $tname (@tables)
{
#        print "DROP TRIGGER IF EXISTS $tname"."_uuid;\n";
#        print "CREATE TRIGGER $triggername BEFORE INSERT ON $tname
#                FOR EACH ROW
#                SET NEW.uuid = UUID();\n";
#        print "UPDATE $tname SET uuid = UUID(), ts = now();\n";

#$sql .= "DROP TRIGGER IF EXISTS ${tname}_delete;
#CREATE TRIGGER ${tname}_delete BEFORE DELETE ON $tname
#FOR EACH ROW
#insert into colony.deleted (uuid, tableName) values (OLD.uuid, '$tname')
#;\n"

$sql .= "update $tname set ts = '2010-07-22' limit 10000;\n";

}

print $sql;
