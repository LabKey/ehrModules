#!/bin/bash
#generate tsv files

#MYSQLPWD=sasa
MYSQLUSER=root
FILEDEST=/usr/local/labkey/files/WNPRC/EHR/@files/

if [ -z "${MYSQLPWD}" ]; then
    echo "Set MYSQLPWD env variable before calling this script"
    exit 1
fi

for dumpfile in scripts/dataset/*.sql
do
    fname=${dumpfile##*/}
    basename=${fname%%.*}
    echo "** dataset $basename"
    time ./generatetsv.sh $dumpfile > $FILEDEST${basename}.tsv
    if [ $? -ne 0 ]; then
        echo "Failed to run '$dumpfile', exiting early"
        exit 1
    fi
    echo
done

for dumpfile in scripts/lists/*.sql
do
    fname=${dumpfile##*/}
    basename=${fname%%.*}
    echo "** list $basename"
    time ./generatetsv.sh $dumpfile > $FILEDEST${basename}.tsv
    if [ $? -ne 0 ]; then
        echo "Failed to run '$dumpfile', exiting early"
        exit 1
    fi
    echo
done

echo "Finished dumping all tsv files."
