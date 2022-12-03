

LDK.Utils.splitIds = function(subjectArray, unsorted, preserveDuplicates) {
    if (!subjectArray){
        return [];
    }

    subjectArray = Ext4.String.trim(subjectArray);
    subjectArray = subjectArray.replace(/[\s,;]+/g, ';');
    subjectArray = subjectArray.replace(/(^;|;$)/g, '');

    if (subjectArray){
        subjectArray = subjectArray.split(';');
    }
    else {
        subjectArray = [];
    }

    EHR.Utils.formatAnimalIds(subjectArray);

    if (subjectArray.length > 0) {

        if (!preserveDuplicates) {
            subjectArray = Ext4.unique(subjectArray);
        }
        if (!unsorted) {
            subjectArray.sort();
        }
    }

    return subjectArray;
}