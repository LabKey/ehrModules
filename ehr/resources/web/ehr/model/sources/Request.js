/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @name EHR.Metadata.Sources.Request
 * This is the default metadata applied any record when displayed in the context of a request.  Metadata placed here
 * can be used to hide fields not editable at time of request.  It also configured a parent/child relationship between the ehr.reqeusts record and dataset records.
 */
EHR.model.DataModelManager.registerMetadata('Request', {
    allQueries: {
        requestid: {
            inheritance: {
                storeIdentifier:  {queryName: 'requests', schemaName: 'ehr'},
                sourceField: 'taskid',
                recordIdx: 0
            }
        },
        date: {
            editorConfig: {
                minValue: (new Date()),
                dateConfig: {
                    minValue: (new Date())
                }
            },
            getInitialValue: function(v, rec){
                if (v)
                    return v;

                v = (new Date()).add(Date.DAY, 2);
                v.setHours(8);
                v.setMinutes(30);
                if (v < (new Date()))
                    v = new Date();

                return v;
            }
        },
        billedby: {
            hidden: true
        },
        chargetype: {
            hidden: true
        },
        caseno: {
            hidden: true
        },
        performedby: {
            hidden: true,
            defaultValue: null,
            allowBlank: true
        },
        remark: {
            hidden: true
        },
        QCState: {
            getInitialValue: function(v){
                var qc;
                if (!v && EHR.Security.getQCStateByLabel('Request: Pending'))
                    qc = EHR.Security.getQCStateByLabel('Request: Pending').RowId;
                return v || qc;
            }
        },
        'id/curlocation/location': {
            shownInGrid: false
        }
    },
    byQuery: {
        'ehr.requests': {
            daterequested: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
            }
        },
        'study.blood': {
            chargetype: {
                hidden: false
            },
            reason: {
                defaultValue: 'Research'
            },
            requestor: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            daterequested: {
                hidden: true
            },
            performedby: {
                allowBlank: true
            },
            num_tubes: {
                xtype: 'ehr-triggernumberfield',
                editorConfig: {
                    allowNegative: false,
                    listeners: {
                        change: function(field, val){
                            EHR.DataEntryUtils.calculateQuantity(field, {num_tubes: val});
                        }
                    }
                },
                nullable: false
            },
            tube_vol: {
                nullable: false,
                editorConfig: {
                    allowNegative: false,
                    listeners: {
                        change: function(field, val){
                            EHR.DataEntryUtils.calculateQuantity(field, {tube_vol: val});
                        }
                    }
                }
            },
            date: {
                nullable: false,
                getInitialValue: function(v){
                    var date = (new Date()).add(Date.DAY, 2);
                    date.setHours(9);
                    date.setMinutes(30);
                    if (v < (new Date()))
                        v = new Date();

                    return v || date;
                }
            },
            tube_type: {
                nullable: false
            },
            project: {
                nullable: false
            },
            instructions: {
                hidden: false,
                xtype: 'textarea',
                formEditorConfig:{
                    xtype: 'textarea',
                    readOnly: false
                }
            }
        },
        'study.encounters': {
            title: {
                hidden: true
            },
            chargetype: {
                hidden: false,
                allowBlank: false
            },
            enddate: {
                hidden: true
            }
        },
        'study.clinpathRuns': {
            date: {
                editorConfig: {
                    minValue: null
                },
                getInitialValue: function(v, rec){
                    //allow same-day requests
                    return v || new Date();
                }
            },
            method: {
                hidden: true
            },
            chargetype: {
                hidden: true
            },
            remark: {
                hidden: false
            }
        },
        'study.drug': {
            performedby: {
                allowBlank: true
            },
            outcome: {
                defaultValue: null,
                hidden: true
            }
        },
        'onprc_ehr.housing_transfer_requests': {
            remark: {
                hidden: false
            }
        }
    }
});