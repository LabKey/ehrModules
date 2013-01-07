/**
 * This is the default metadata applied to all Tasks when using getTableMetadata().
 * Among other things, it sets of the parent/child relationship for cild records to inherit taskId from the ehr.tasks record.
 */
EHR.Metadata.registerMetadata('Task', {
    allQueries: {
        QCState: {
//            parentConfig: {
//                storeIdentifier: {queryName: 'tasks', schemaName: 'ehr'},
//                dataIndex: 'qcstate'
//            }
            hidden: false
            //,defaultValue: 2
        }
        ,taskid: {
            parentConfig: {
                storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
                ,dataIndex: 'taskid'
            }
            ,hidden: true
        }
    },
    byQuery: {
        tasks: {
            category: {defaultValue: 'Task'}
        }
        ,'Blood Draws': {
            requestor:{xtype: 'displayfield'},
            performedby: {allowBlank: false},
            billedby: {allowBlank: false},
            tube_type: {allowBlank: false},
            daterequested: {
                hidden: false,
                xtype: 'datefield',
                editorConfig: {
                    readOnly: true
                }
            }
        }
        ,Deaths: {
            tattoo: {
                allowBlank: false
            }
        }
    }
});