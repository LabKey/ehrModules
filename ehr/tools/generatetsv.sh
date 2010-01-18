#!/bin/bash
#
# Generate a valid tsv file from one of the queries in this directory
# ./generatetsv.sh arrival
#
MYSQLPWD=sasa
MYSQLUSER=root
SCRIPT=$1
ROWCOUNT=${2:-50}
BASENAME=${SCRIPT%%.*}


#echo "Using script $1. Creating tsv with $ROWCOUNT rows."

#rm tempdata
echo "use colony;" > tempscript
cat $1 >> tempscript
echo " ORDER BY DATE DESC LIMIT $ROWCOUNT ;" >> tempscript
mysql -u${MYSQLUSER} -p${MYSQLPWD} -B < tempscript | sed s/NULL//g 

#java FixTabs < tempdata >> temptsv

