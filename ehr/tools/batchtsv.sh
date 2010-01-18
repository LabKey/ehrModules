#!bash
#generate tsv files
mysql -u${MYSQLUSER} -p${MYSQLPWD} -B < setup.sql
for dumpfile in scripts/dataset/*.sql
do
  fname=${dumpfile##*/}
  basename=${fname%%.*}
    echo $basename
    ./generatetsv.sh $dumpfile > ../ehr-study/datasets/${basename}.tsv
done
