#!/bin/bash
#generate tsv files

#FILEDEST=/usr/local/labkey/files/WNPRC/EHR/@files/ehr-studylocal/
FILEDEST=/home/kevink/labkey/release10.1/server/customModules/ehr/ehr-6mos/

. setup.sh

if [ ! -f $FILEDEST/datasets/EHRStudy.dataset -o \
    ${DATE_CUTOFF_FILE} -nt ${FILEDEST}/datasets/EHRStudy.dataset -o \
    ./scripts/setup/EHRStudy.dataset -nt ${FILEDEST}/datasets/EHRStudy.dataset ]
then
    echo "Generating new EHRStudy.dataset file"
    eval "echo \"`cat ./scripts/setup/EHRStudy.dataset`\"" > ${FILEDEST}/datasets/EHRStudy.dataset
fi

for script in scripts/dataset/*.sql
do
    fname=${script##*/}
    basename=${fname%%.*}
    echo
    echo "** dataset $basename"
    time ./generatetsv.sh $script ${FILEDEST}datasets/${basename}.tsv
    if [ $? -ne 0 ]; then
        echo "Failed running '$script', exiting early"
        exit 1
    fi
done

for script in scripts/lists/*.sql
do
    fname=${script##*/}
    basename=${fname%%.*}
    echo
    echo "** list $basename"
    time ./generatetsv.sh $script ${FILEDEST}lists/${basename}.tsv
    if [ $? -ne 0 ]; then
        echo "Failed running '$script', exiting early"
        exit 1
    fi
done

echo "Finished dumping all tsv files."
