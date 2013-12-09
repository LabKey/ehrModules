/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EHR.model.DataModelManager.registerMetadata('Necropsy', {
    allQueries: {
        performedby: {
            allowBlank: true
        },
        chargetype: {
            allowBlank: false
        }
    },
    byQuery: {
        'study.encounters': {
            type: {
                defaultValue: 'Necropsy',
                hidden: true
            },
            title: {
                hidden: true
            },
            procedureid: {
                hidden: false,
                getInitialValue: function(val, record){
                    if (val){
                        return val;
                    }

                    var procedureStore = EHR.DataEntryUtils.getProceduresStore();
                    LDK.Assert.assertNotEmpty('Unable to find procedureStore from Necropsy.js', procedureStore);

                    if (LABKEY.ext.Ext4Helper.hasStoreLoaded(procedureStore)){
                        var procRecIdx = procedureStore.find('name', 'Necropsy');
                        var procedureRec = procedureStore.getAt(procRecIdx);
                        LDK.Assert.assertNotEmpty('Unable to find procedure record with name Necropsy from Necropsy.js', procedureRec);

                        return procedureRec ? procedureRec.get('rowid') : null;
                    }
                    else {
                        console.log('procedure store not loaded');
                        procedureStore.on('load', function(store){
                            var procRecIdx = store.find('name', 'Necropsy');
                            var procedureRec = store.getAt(procRecIdx);
                            LDK.Assert.assertNotEmpty('Unable to find procedure record with name Necropsy after load from Necropsy.js', procedureRec);

                            if (procedureRec){
                                record.set('procedureid', procedureRec.get('rowid'));
                            }
                        }, this, {single: true});
                    }

                    return null;
                }
            },
            instructions: {
                hidden: true
            },
            chargetype: {
                defaultValue: 'Surgery Staff'
            },
            caseno: {
                xtype: 'ehr-pathologycasenofield',
                hidden: false
            },
            performedby: {
                hidden: true
            },
            remark: {
                header: 'General Comments',
                label: 'General Comments',
                height: 300,
                editorConfig: {
                    width: 500
                }
            }
        }
    }
});