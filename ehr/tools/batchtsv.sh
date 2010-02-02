#!/bin/bash
#generate tsv files

MYSQLPWD=sasa
MYSQLUSER=root

if [ -z "${MYSQLPWD}" ]; then
    echo "Set MYSQLPWD env variable before calling this script"
    exit 1
fi

#mysql -u${MYSQLUSER} -p${MYSQLPWD} -B < scripts/setup/setup.sql
#if [ $? -ne 0 ]; then
#    echo "ERROR trying to setup mysql functions"
#    exit 1
#fi

for dumpfile in scripts/dataset/*.sql
do
    fname=${dumpfile##*/}
    basename=${fname%%.*}
    echo "** $basename"
    time ./generatetsv.sh $dumpfile > ../ehr-study/datasets/${basename}.tsv
    if [ $? -ne 0 ]; then
        exit 1
    fi
    echo
done
