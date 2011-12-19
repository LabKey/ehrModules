#!/bin/bash
#generate tsv files

#PIPELINE_ROOT=/home/kevink/labkey/release10.1/server/customModules/ehr
#STUDY_DIR=${PIPELINE_ROOT}/ehr-6mos

PIPELINE_ROOT=/Users/bimber/mysql-dump
STUDY_DIR=${PIPELINE_ROOT}

STUDY_LOAD_FILE=${PIPELINE_ROOT}/studyload.txt

. setup.sh

#if [ ! -f $STUDY_DIR/datasets/EHRStudy.dataset -o \
#    ${DATE_CUTOFF_FILE} -nt ${STUDY_DIR}/datasets/EHRStudy.dataset -o \
#    ./scripts/setup/EHRStudy.dataset -nt ${STUDY_DIR}/datasets/EHRStudy.dataset ]
#then
#    echo "Generating new EHRStudy.dataset file"
#    eval "echo \"`cat ./scripts/setup/EHRStudy.dataset`\"" > ${STUDY_DIR}/datasets/EHRStudy.dataset
#fi

for script in scripts/dataset/*.sql
do
    fname=${script##*/}
    basename=${fname%%.*}
    echo
    echo "** dataset $basename"
    time ./generatetsv.sh $script ${STUDY_DIR}/datasets/${basename}.tsv
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
    time ./generatetsv.sh $script ${STUDY_DIR}/lists/${basename}.tsv
    if [ $? -ne 0 ]; then
        echo "Failed running '$script', exiting early"
        exit 1
    fi
done

touch ${STUDY_LOAD_FILE}
echo "Finished dumping all tsv files."
