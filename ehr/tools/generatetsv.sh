#!/bin/bash
#
# Generate a valid tsv file from one of the queries in this directory
# ./generatetsv.sh arrival
#
MYSQLPWD=sasa
MYSQLUSER=root
TSVDIR=../ehr-study/datasets

#rm tempdata
echo "use colony;" > tempscript
cat scripts/$1.sql >> tempscript
echo " ORDER BY DATE DESC LIMIT 50 ;" >> tempscript
mysql -u${MYSQLUSER} -p${MYSQLPWD} -B < tempscript | sed s/NULL//g > $TSVDIR/$1.tsv

#java FixTabs < tempdata >> temptsv

