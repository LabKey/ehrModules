#!bash
#generate tsv files

names=(arrival	assignment	bacteriology	behavetrem	biopsy	biopsydiag	birth	blood	chemisc	chemistry	clintrem	demographics)
for basename in ${names[@]}
do
    echo $basename
    ./generatetsv.sh $basename
done
