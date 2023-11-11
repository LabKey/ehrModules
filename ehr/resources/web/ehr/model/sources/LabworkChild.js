/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(function(){

    let refRanges = {};

    LABKEY.Query.selectRows({
        schemaName: 'ehr_lookups',
        queryName: 'lab_test_range',
        columns: 'test,ref_range_min,ref_range_max',
        success: function(results){
            if (results.rows.length){
                for (let i = 0; i < results.rows.length; i++){
                    refRanges[results.rows[i].test] = {
                        min: results.rows[i].ref_range_min,
                        max: results.rows[i].ref_range_max
                    }
                }
            }
        },
        scope: this
    });

    EHR.model.DataModelManager.registerMetadata('LabworkChild', {
        allQueries: {
            Id: {
                editable: false
            },
            testid: {
                editorConfig: {
                    plugins: [{
                        ptype: 'ldk-usereditablecombo',
                        allowChooseOther: false
                    }]
                }
            },
            result: {
                columnConfig: {
                    renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
                        if (value && refRanges[record.get('testid')]) {
                            if (value < refRanges[record.get('testid')].min) {
                                metaData.style = 'background-color: #FBEC5D;';
                            }
                            else if (value > refRanges[record.get('testid')].max) {
                                metaData.style = 'background-color: #F66760;';
                            }
                            else {
                                metaData.style = 'background-color: #00C200;';
                            }
                        }
                        return value; // Return the cell value
                    }
                }
            }
        }
    });

})();