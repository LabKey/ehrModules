#!/bin/bash
#
# Generate a valid tsv file from one of the queries in this directory
# ./generatetsv.sh arrival
#
MYSQLPWD=sasa
MYSQLUSER=root
SCRIPT=$1
ROWCOUNT=${2:-10}
FILENAME=${SCRIPT##*/}
BASENAME=${FILENAME%%.*}

if [ -z "${SCRIPT}" ]; then
    echo "Missing script argument"
    echo "Usage: $0 script.sql [row-count] > out-file.tsv"
    exit 1
fi

mysql -u${MYSQLUSER} -p${MYSQLPWD} -B < scripts/setup/setup.sql
if [ $? -ne 0 ]; then
    echo "ERROR trying to setup mysql functions"
    exit 1
fi

echo "use colony;" > tempscript
cat $1 >> tempscript

case $1 in

    scripts/lists/snomap.sql | scripts/dataset/*.sql )
        echo " ORDER BY DATE DESC" >> tempscript
        ;;

    scripts/lists/*.sql )
        # other lists don't have dates
        ;;

esac

echo " LIMIT $ROWCOUNT" >> tempscript
echo " ;" >> tempscript

# sed script truncates nulls and backslash-escapes the double-quote character
mysql -u${MYSQLUSER} -p${MYSQLPWD} -B < tempscript | sed -e 's/NULL//g;s@"@\\"@g'
if [ $? -ne 0 ]; then
    echo "ERROR trying to dump table using script $1"
    exit 1
fi

