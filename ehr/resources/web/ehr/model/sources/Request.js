/*
 * Copyright (c) 2013 LabKey Corporation
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
                minValue: (new Date()).add(Date.DAY, 2),
                dateConfig: {
                    minValue: (new Date()).add(Date.DAY, 2)
                }
            },
            getInitialValue: function(v, rec){
                if (v)
                    return v;

                v = (new Date()).add(Date.DAY, 2);
                v.setHours(8);
                v.setMinutes(30);

                return v;
            }
        },
        performedby: {
            hidden: true,
            allowBlank: true
        },
        remark: {
            hidden: true
        },
//        daterequested: {
//            editorConfig: {
//                minValue: (new Date()).add(Date.DAY, 2)
//            }
//        },
        QCState: {
            //defaultValue: 5,
            setInitialValue: function(v){
                var qc;
                if(!v && EHR.Security.getQCStateByLabel('Request: Pending'))
                    qc = EHR.Security.getQCStateByLabel('Request: Pending').RowId;
                return v || qc;
            }
        },
        restraint: {
            hidden: true
        },
        restraintDuration: {
            hidden: true
        },
        'id/curlocation/location': {
            shownInGrid: false
        }
    },
    byQuery: {
        'ehr.project': {
            protocol: {
                hidden: true
            },
            avail: {
                hidden: true
            }
        },
        'ehr.requests': {
            daterequested: {
                xtype: 'datefield',
                extFormat: 'Y-m-d'
                //nullable: false
            }
        },
        'study.Blood Draws': {
            requestor: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            daterequested: {
                hidden: true
            },
            billedby: {
                hidden: true
            },
            assayCode: {
                hidden: true
            },
            performedby: {
                allowBlank: true
            },
            quantity : {
                xtype: 'displayfield'
            },
            num_tubes: {
                xtype: 'ehr-triggernumberfield',
                editorConfig: {
                    allowNegative: false,
                    listeners: {
                        change: function(field, val){
                            var form = field.up('form');
                            if(form){
                                form.getForm().findField('quantity').calculateQuantity();
                            }
                            else {
                                console.error('unable to find form')
                            }
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
                            var form = field.up('form');
                            if(form)
                                form.getForm().findField('quantity').calculateQuantity();
                        }
                    }
                }
            },
            date: {
                nullable: false,
                editorConfig: {
                    timeConfig: {
                        minValue: '8:30',
                        maxValue: '9:30',
                        increment: 60
                    }
                },
                setInitialValue: function(v){
                    var date = (new Date()).add(Date.DAY, 2);
                    date.setHours(9);
                    date.setMinutes(30);
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
                formEditorConfig:{xtype: 'textarea', readOnly: false}
            }
        },
        'study.Clinical Encounters': {
            title: {
                hidden: true
            },
            performedby: {
                allowBlank: true
            },
            enddate: {
                hidden: true
            },
            major: {
                hidden: true
            },
            restraint: {
                hidden: true
            },
            restraintDuration: {
                hidden: true
            },
            serviceRequested: {
                xtype: 'ehr-remark',
                isAutoExpandColumn: true,
                printWidth: 150,
                editorConfig: {
                    resizeDirections: 's'
                }
            }
        },
        'study.Clinpath Runs': {
            date: {
                editorConfig: {
                    minValue: null
                }
            },
            serviceRequested: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
            remark: {
                hidden: false
            }
        },
        'study.Drug Administration': {
            performedby: {
                allowBlank: true
            }
        }
    }
});