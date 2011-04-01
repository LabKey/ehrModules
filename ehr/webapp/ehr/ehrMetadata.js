/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.ns('EHR.ext.Metadata');

/*
 new properties:

 noDuplicateByDefault
 allowDuplicateValue

 noSaveInTemplateByDefault
 allowSaveInTemplate

 ignoreColWidths
 defaultValue
 colModel = {}
 setInitialValue()
 parentConfig: {
 storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
 ,dataIndex: 'taskid'
 }
 shownInGrid
 shownInForm
 useNull  //this is ext, but not documented
 editorConfig
 gridEditorConfig
 formEditorConfig
 isAutoExpandColumn

 */
EHR.ext.getTableMetadata = function(queryName, sources)
{
    var meta = {};

    EHR.utils.rApplyClone(meta, EHR.ext.Metadata.Standard.allQueries);
//
    if (EHR.ext.Metadata.Standard.byQuery[queryName])
    {
        EHR.utils.rApplyClone(meta, EHR.ext.Metadata.Standard.byQuery[queryName]);
    }

    if (sources && sources.length)
    {
        Ext.each(sources, function(source)
        {
            if (EHR.ext.Metadata[source])
            {
                if (EHR.ext.Metadata[source].allQueries)
                {
                    EHR.utils.rApplyClone(meta, EHR.ext.Metadata[source].allQueries);
                }

                if (EHR.ext.Metadata[source].byQuery && EHR.ext.Metadata[source].byQuery[queryName])
                {
                    EHR.utils.rApplyClone(meta, EHR.ext.Metadata[source].byQuery[queryName]);
                }

            }
        }, this);
    }

    return meta;
};

EHR.ext.Metadata.Standard = {
    allQueries: {
        fieldDefaults: {
            //lazyCreateStore: false,
            ignoreColWidths: true
        },
        Id: {
            xtype: 'ehr-participant',
            dataIndex: 'Id',
            nullable: false,
            allowBlank: false,
            lookups: false,
            colModel: {
                width: 70
            },
            noDuplicateByDefault: true
        },
        'id/curlocation/location': {
            hidden: true,
            allowBlank: true,
            nullable: true,
            shownInGrid: true,
            caption: 'Current Location',
            header: 'Current Location',
            lookups: false,
            allowDuplicateValue: false
        }
        ,date: {
            allowBlank: false,
            nullable: false,
            noDuplicateByDefault: true,
            format: 'Y-m-d H:i',
            editorConfig: {
                dateFormat: 'Y-m-d',
                timeFormat: 'H:i'
            },
            xtype: 'xdatetime',
            colModel: {
                fixed: true,
                width: 130
            },
            setInitialValue: function(v, rec)
            {
                return v ? v : new Date()
            }
        }
        ,begindate: {
            xtype: 'xdatetime',
            hidden: true,
            format: 'Y-m-d H:i',
            editorConfig: {
                dateFormat: 'Y-m-d',
                timeFormat: 'H:i'
            },
            colModel: {
                fixed: true,
                width: 130
            }
        }
        ,enddate: {
            xtype: 'xdatetime',
            colModel: {
                fixed: true,
                width: 130
            },
            format: 'Y-m-d H:i',
            editorConfig: {
                dateFormat: 'Y-m-d',
                timeFormat: 'H:i'
            }
        }
        ,serviceRequested: {
            xtype: 'displayfield'
            ,editorConfig: {
                height: 100
            }
        }
        ,code: {
            xtype: 'ehr-snomedcombo'
            //,lookups: false
            ,colModel: {
                width: 150
            }
            ,getRenderer: function(col, meta){
                return function(data, cellMetaData, record, rowIndex, colIndex, store) {
                    var storeId = ['ehr_lookups', 'snomed', 'code', 'meaning', store.queryName, (meta.dataIndex || meta.name)].join('||');
                    var lookupStore = Ext.StoreMgr.get(storeId);

                    if(!lookupStore)
                        return '';

                    var idx = lookupStore.find('code', data);
                    var lookupRecord;
                    if(idx != -1)
                        lookupRecord = lookupStore.getAt(idx);

                    if (lookupRecord)
                        return lookupRecord.data['meaning'] || lookupRecord.data['code/meaning'];
                    else if (data)
                        return "[" + data + "]";
                    else
                        return meta.lookupNullCaption || "[none]";
                }
            }
        }
        ,tissue: {
            xtype: 'ehr-snomedcombo',
            editorConfig: {
                defaultSubset: ''
            }
        }
        ,performedby: {
            colModel: {
                width: 65
            }
        }
        ,userid: {
            lookup: {
                schemaName: 'core',
                queryName: 'users',
                displayColumn: 'Email',
                keyColumn: 'UserId',
                sort: 'Email'
            }
            ,formEditorConfig:{readOnly: true}
            ,defaultValue: LABKEY.Security.currentUser.id
            ,shownInGrid: false
        }
        ,created: {hidden: true}
        //,CreatedBy: {hidden: true, shownInGrid: false}
        ,AnimalVisit: {hidden: true}
        ,Modified: {hidden: true}
        ,ModifiedBy: {hidden: true, shownInGrid: false, useNull: true}
        ,SequenceNum: {hidden: true}
        ,Description: {hidden: true}
        ,Dataset: {hidden: true}
        ,category: {hidden: true}
        ,QCState: {
            allowBlank: false,
            defaultValue: 2,
            shownInGrid: false,
            hidden: true,
            editorConfig: {
                disabled: true
            }
        }
        ,parentId: {
            lookups: false
        }
        ,parentid: {
            lookups: false
        }
        ,taskid: {
            lookups: false,
            hidden: true
        }
        ,requestid: {
            lookups: false,
            hidden: true
        }
        ,AgeAtTime: {hidden: true}
        ,Notes: {hidden: true}
        ,DateOnly: {hidden: true}
        ,Survivorship: {hidden: true}
        ,remark: {
            xtype: 'ehr-remark',
            isAutoExpandColumn: true
//            editorConfig: {
//                style: 'width: 100%;max-width: 600px;min-width: 200px;'
//            }
        }
        ,project: {
            xtype: 'ehr-project'
            ,shownInGrid: false
            ,lookup: {
                columns: 'project,account'
            }
        }
        ,account: {
            shownInGrid: false
        }
    },
    byQuery: {
        tasks: {
            taskid: {
                setInitialValue: function(v, rec)
                {
                    v = v || this.importPanel.formUUID || LABKEY.Utils.generateUUID();
                    this.importPanel.formUUID = v;
                    this.formUUID = v;
                    return v;
                },
                parentConfig: false,
                hidden: true
            },
            //NOTE: the case is different on hard tables than studies.
            //i tried to force hard tables to use QCState, but they kept reverting in odd places
            qcstate: {
                allowBlank: false,
                defaultValue: 2,
                shownInGrid: false,
                parentConfig: false,
                hidden: false,
                editorConfig: {
                    disabled: true
                }
            },
            assignedto: {
                useNull: true,
                defaultValue: LABKEY.Security.currentUser.id,
                lookup: {
                    sort: 'type,name'
                }
            },
            duedate: {
                xtype: 'xdatetime',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                }
            },
            rowid: {
                xtype: 'displayfield'
            },
            formtype: {
                xtype: 'displayfield',
                hidden: true,
                setInitialValue: function(val, rec){
                    return val || this.importPanel.formType;
                }
            },
            title: {
                setInitialValue: function(val, rec){
                    return val || this.importPanel.formType;
                }
            }
        },
        requests: {
            requestid: {
                setInitialValue: function(v, rec)
                {
                    v = v || this.importPanel.formUUID || LABKEY.Utils.generateUUID();
                    this.importPanel.formUUID = v;
                    this.formUUID = v;
                    return v;
                },
                parentConfig: false,
                hidden: true
            },
            notify1: {
                lookup: {
                    sort: 'type,name'
                }
            },
            notify2: {
                lookup: {
                    sort: 'type,name'
                }
            },
            daterequested: {
                xtype: 'xdatetime'
            },
            priority: {
                defaultValue: 'Routine'
            },
            rowid: {
                xtype: 'displayfield'
            },
            formtype: {
                xtype: 'displayfield',
                hidden: true,
                setInitialValue: function(val, rec){
                    return val || this.importPanel.formType;
                }
            },
            title: {
                setInitialValue: function(val, rec){
                    return val || this.importPanel.formType;
                }
            },
            //NOTE: the case is different on hard tables than studies.
            //i tried to force hard tables to use QCState, but they kept reverting in odd places
            qcstate: {
                allowBlank: false,
                defaultValue: 5,
                shownInGrid: false,
                parentConfig: false,
                hidden: false,
                editorConfig: {
                    disabled: true
                }
            }
        },
        'Bacteriology Results': {
            source: {
                xtype: 'ehr-snomedcombo'
            },
            result: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Bacteriology Results'
                }
            },
            antibiotic: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Antibiotic'
                }
            }
        },
        'Parasitology Results': {
            code: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Parasitology Results'
                }
            }
        },
        'Tissue Samples': {
            diagnosis: {
                xtype: 'ehr-snomedcombo'
            }
        },
        Histology: {
            diagnosis: {
                xtype: 'ehr-snomedcombo'
            },
            slideNum: {
                setInitialValue: function(v, rec){
                    var idx = Ext.StoreMgr.get('study||Histology||||').getCount()+1;
                    return v || idx;
                }
            }
        },
        'Clinical Encounters': {
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
            ,performedby: {allowBlank: false}
        },
        'Clinical Remarks': {
            performedby: {hidden: true}
        },
        'Clinpath Runs': {
            collectionDate : {shownInGrid: false},
            collectionMethod : {shownInGrid: false},
            collectedBy : {shownInGrid: false}
        },
        'Dental Status': {
            gingivitis: {allowBlank: false, lookupNullCaption: 'N/A'},
            tartar: {allowBlank: false, lookupNullCaption: 'N/A'},
            performedby: {hidden: true}
        },
        'Necropsy Diagnosis': {
            duration: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: ''
                }
            },
            severity: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: ''
                }
            },
            distribution: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: ''
                }
            },
            process: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: ''
                }
            }
        },
        'Treatment Orders': {
            date: {
                allowBlank: false,
                setInitialValue: function(v, rec)
                {
                    return v ? v : new Date()
                },
                shownInGrid: true
            }
            ,CurrentRoom: {lookups: false}
            ,CurrentCage: {lookups: false}
            ,volume: {shownInGrid: false}
            ,vunits: {shownInGrid: false}
            ,conc: {shownInGrid: false}
            ,cunits: {shownInGrid: false}
            ,amount: {shownInGrid: false}
            ,units: {shownInGrid: false}
            ,route: {shownInGrid: false}
            ,code: {
                editorConfig: {
                    defaultSubset: 'Treatment Codes'
                }
            }
        },
        Project: {
            project: {
                xtype: 'textfield',
                lookups: false
            }
        },
        'Body Condition': {
            performedby: {hidden: true}
        },
        Alopecia: {
            head: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            dorsum: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            rump: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            shoulders: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            upperArms: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            lowerArms: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            hips: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            upperLegs: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            lowerLegs: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            other: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'NA', formEditorConfig: {columns: 3}},
            score: {lookupNullCaption: '', useNull: true},
            performedby: {hidden: true}
        },
        Restraint: {
//            enddate: {
//                hidden: true
//            },
            type: {
                formEditorConfig: {xtype: 'ehr-remoteradiogroup', columns: 2},
                defaultValue: ''
            }
        },
        cage_observations: {
            date: {
                parentConfig: false,
                hidden: false,
                allowBlank: false,
                setInitialValue: function(v, rec)
                {
                    return v ? v : new Date()
                }
            },
            remark: {
                allowBlank: false,
                formEditorConfig: {
                    storeCfg: {
                        schemaName: 'ehr_lookups',
                        queryName: 'obs_remarks',
                        valueField: 'remark',
                        displayField: 'title'
                    }
                }
            },
            //NOTE: labkey is reporting the table as '_select' otherwise
            room: {
                lookup: {queryName: 'rooms'}
            },
            cage: {
                allowBlank: false
            }
            //,performedby: {allowBlank: false}
        },
        Charges: {
            type: {
                includeNullRecord: false,
                allowBlank: false,
                lookup: {
                    columns: 'category,description,cost',
                    sort: 'category,description',
                    displayColumn: 'description'
                },
                editorConfig: {
                    tpl : function()
                    {
                        var tpl = new Ext.XTemplate(
                                '<tpl for=".">' +
                                        '<div class="x-combo-list-item">{[ values["category"] ? "<b>"+values["category"]+":</b> "  : "" ]}{[ values["description"] ]}' +
                                        '&nbsp;</div></tpl>'
                                );
                        return tpl.compile()
                    }(),
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.ownerCt.getForm();
                            if(theForm){
                                theForm.findField('unitCost').setValue(rec.get('cost'));
                                theForm.findField('type').setValue(rec.get('description'));
                            }
                        }
                    }
                }

            },
            unitCost: {
                xtype: 'displayfield'
            },
            quantity: {
                allowBlank: false,
                defaultValue: 1
            },
            performedby: {
                hidden: true
            },
            remark: {
                shownInGrid: false
            },
            date: {
                xtype: 'datefield',
                format: 'Y-m-d'
            }
        },
        'Blood Chemistry Results': {
            resultOORIndicator: {
                label: 'Result',
                shownInGrid: false,
                compositeField: 'Result',
                width: 80,
                includeNullRecord: false,
                nullCaption: '',
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'oor_indicators',
                    keyColumn: 'indicator',
                    displayColumn: 'indicator'
                }
            }
            ,result: {
                compositeField: 'Result'
            }
        },
        'Irregular Observations': {
            RoomAtTime: {hidden: true}
            ,CageAtTime: {hidden: true}
            ,feces: {shownInGrid: false, xtype: 'ehr-remotecheckboxgroup', includeNullRecord: false, formEditorConfig: {columns: 3}}
            ,menses: {shownInGrid: false, xtype: 'ehr-remoteradiogroup', defaultValue: null, value: null, includeNullRecord: true, formEditorConfig: {columns: 3}}
            ,other: {shownInGrid: false, xtype: 'ehr-remotecheckboxgroup', includeNullRecord: false, formEditorConfig: {columns: 3}}
            ,tlocation: {
                shownInGrid: false,
                xtype: 'lovcombo',
                includeNullRecord: false,
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_tlocation', displayColumn: 'location', keyColumn: 'location', sort: 'sort_order'},
                editorConfig: {
                    tpl: null
//                    height: 200
                }
            }
            ,breeding: {shownInGrid: false, xtype: 'ehr-remotecheckboxgroup', includeNullRecord: false, formEditorConfig: {columns: 3}}
            ,project: {hidden: true}
            ,account: {hidden: true}
            ,performedby: {allowBlank: false}
            ,remark: {
                shownInGrid: false,
                formEditorConfig: {
                    storeCfg: {
                        schemaName: 'ehr_lookups',
                        queryName: 'obs_remarks',
                        valueField: 'remark',
                        displayField: 'title'
                    }
                }
            }
            ,behavior: {shownInGrid: false, xtype: 'ehr-remotecheckboxgroup', includeNullRecord: false, formEditorConfig: {columns: 3}}
            ,otherbehavior: {shownInGrid: false}
//            ,certified: {
//                xtype: 'ehr-approveradio',
//                isAutoExpandColumn: true,
//                colModel: {
//                    width: 30
//                },
//                //we allow either true or null, so it works with client-side 'allowBlank'
//                convert: function(v){
//                    return (v===true ? true : null);
//                },
//                allowDuplicateValue: false
//            }
        },
        'Clinpath Requests': {
            dateCompleted: {hidden: true}
            ,status: {hidden: true}
            ,requestor: {defaultValue: LABKEY.Security.currentUser.email}
            ,notify1: {shownInGrid: false}
            ,notify2: {shownInGrid: false}

        },
        Menses: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true},
            interval: {hidden: true}
        },
        'Pair Tests': {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true}
        },
        'Behavior Remarks': {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true},
            remark: {
                label: 'Other Remark'
            }
        },
        Arrival: {
            project: {hidden: true},
            account: {hidden: true},
            source: {allowBlank: false},
            performedby: {hidden: true}
        },
        Departure: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true},
            authorized_by: {allowBlank: false},
            destination: {allowBlank: false}
        },
        Vitals: {
            performedby: {hidden: true}
        },
        Teeth: {
            performedby: {hidden: true}
        },
        Deaths: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true},
            necropsy: {lookups: false}
        },
        'Error Reports': {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true}
        },
        Birth: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true},
            dam: {lookups: false, allowBlank: false},
            sire: {lookups: false},
            gender: {includeNullRecord: false, allowBlank: false}
        },
        'Blood Draws' : {
            caretaker: {shownInGrid: false}
            ,remark: {shownInGrid: false}
            ,project: {shownInGrid: false}
            ,requestor: {shownInGrid: false, formEditorConfig:{readOnly: true}}
            ,done_by: {shownInGrid: false}
            ,performedby: {shownInGrid: false}
            ,sampleId: {shownInGrid: false}
            ,additionalServices: {
                xtype: 'lovcombo',
                includeNullRecord: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_draw_services',
                    displayColumn: 'service',
                    keyColumn: 'service'
                },
                editorConfig: {
                    tpl: null
                }
            }
            ,tube_type: {
                xtype: 'combo',
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_draw_tube_type',
                    displayColumn: 'type',
                    keyColumn: 'type',
                    columns: 'type,volume'
                },
                editorConfig: {
                    listeners: {
                        select: function(field, rec){
                            var theForm = this.ownerCt.getForm();
                            theForm.findField('tube_vol').setValue(rec.get('volume'));
                            theForm.findField('quantity').calculateQuantity();
                        }
                    }
                }
            }
            ,quantity: {
                xtype: 'displayfield',
                editorConfig: {
                    calculateQuantity: function(){
                        var form = this.ownerCt.getForm();
                        var numTubes = form.findField('num_tubes').getValue();
                        var tube_vol = form.findField('tube_vol').getValue();

                        var quantity = numTubes*tube_vol;
                        this.setValue(quantity);
                        this.fireEvent('change', quantity, this.startValue);
                    }
                }
            }
            ,num_tubes: {
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            this.ownerCt.getForm().findField('quantity').calculateQuantity();
                        }
                    }
                }
                ,allowBlank: false
            }
            ,tube_vol: {
                shownInGrid: false,
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            this.ownerCt.getForm().findField('quantity').calculateQuantity();
                        }
                    }
                }
                ,allowBlank: false
            }
        },
        'Procedure Codes': {
            code: {
                editorConfig: {
                    defaultSubset: 'Procedures'
                }
            },
            performedby: {
                hidden: true
            }
        },
        'Drug Administration': {
            enddate: {
                shownInGrid: false
            }
            ,code: {
                editorConfig: {
                    defaultSubset: 'Drugs'
                }
            }
            ,date: {
                header: 'Start Time'
                ,label: 'Start Time'
                ,hidden: false
            }
            ,HeaderDate: {
                xtype: 'xdatetime'
                ,hidden: true
                ,shownInGrid: false
            }
            ,remark: {shownInGrid: false}
            ,dosage: {
                xtype: 'ehr-drugdosefield',
                shownInGrid: false,
                compositeField: 'Dosage'
            }
            ,dosage_units: {
                shownInGrid: false,
                compositeField: 'Dosage'
            }
            ,concentration: {
                shownInGrid: false,
                compositeField: 'Drug Conc',
                editorConfig: {
                    decimalPrecision: 10
                }
            }
            ,conc_units: {
                shownInGrid: false
                ,lookup: {columns: '*'}
                ,compositeField: 'Drug Conc'
                ,editorConfig: {
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            theForm.findField('amount_units').setValue(rec.get('numerator'));
                            theForm.findField('conc_units').setValue(rec.get('unit'));
                            theForm.findField('vol_units').setValue(rec.get('denominator'));

                            var doseField = theForm.findField('dosage_units');
                            if(rec.get('numerator'))
                                doseField.setValue(rec.get('numerator')+'/kg');
                            else
                                doseField.setValue('');

                            doseField.fireEvent('change', doseField.getValue(), doseField.startValue);

                        }
                    }
                }
            }
            ,route: {shownInGrid: false}
            ,volume: {
                compositeField: 'Volume'
            }
            ,vol_units: {
                compositeField: 'Volume'
//                editorConfig: {
//                    fieldLabel: null
//                }
            }
            ,amount: {
                compositeField: 'Amount'
                ,allowBlank: false
                ,shownInGrid: false
                ,colModel: {
                    width: 40
                }
            }
            ,amount_units: {
                shownInGrid: false
                ,compositeField: 'Amount'
                ,colModel: {
                    width: 70
                }
            }
            ,performedby: {
                allowBlank: false
            }
        },
        Notes: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true}
        },
        'Problem List': {
            project: {hidden: true},
            account: {hidden: true},
            performedby: {hidden: true},
            problem_no: {shownInInsertView: false}
        },
        'Clinical Observations': {
            observation: {
                xtype: 'ehr-remoteradiogroup',
                //defaultValue: 'Normal',
                allowBlank: false,
                includeNullRecord: false,
                editorConfig: {columns: 2},
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'normal_abnormal',
                    displayColumn: 'state',
                    keyColumn: 'state',
                    sort: '-state'
                }
            },
            date: {
                label: 'Time'
            },
            performedby: {hidden: true}
        },
        'TB Tests': {
            lot: {
                shownInGrid: false
            },
            dilution: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: false
            },
            eye: {
                colModel: {
                    width: 40
                }
            },
            result1: {
                colModel: {
                    width: 40
                }
            },
            result2: {
                colModel: {
                    width: 40
                }
            },
            result3: {
                colModel: {
                    width: 40
                }
            }
        },
        Weight: {
            project: {
                hidden: true
            }
            ,account: {
                hidden: true
            }
            ,weight: {
                allowBlank: false
                ,useNull: true
            }
            ,performedby: {allowBlank: false}
        }
    }
};

EHR.ext.Metadata.Task = {
    allQueries: {
        QCState: {
            parentConfig: {
                storeIdentifier: {queryName: 'tasks', schemaName: 'ehr'},
                dataIndex: 'qcstate'
            }
            ,hidden: true
            ,defaultValue: 2
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
            requestor:{xtype: 'displayfield'}
        }
    }
};

EHR.ext.Metadata.SimpleForm = {
    allQueries: {
        QCState: {
            parentConfig: {
                storeIdentifier: {queryName: 'tasks', schemaName: 'ehr'},
                dataIndex: 'qcstate'
            }
            ,hidden: true
            ,defaultValue: 2
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
            category: {
                defaultValue: 'Generic Form'
            }
        }
    }
};


EHR.ext.Metadata.Encounter = {
    allQueries: {
        Id: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'Id'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,date: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'date'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,parentId: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'objectid'
            }
            ,hidden: false
            ,shownInGrid: false
            ,allowBlank: false
        }
        ,project: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'project'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,account: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'account'
            }
            ,hidden: true
            ,shownInGrid: false
        }
    },
    byQuery: {
        'Treatment Orders': {
            date: {
                parentConfig: false,
                hidden: false,
                allowBlank: false,
                setInitialValue: function(v, rec)
                {
                    return v ? v : new Date()
                },
                shownInGrid: true
            }
        },
        'Drug Administration': {
            HeaderDate: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                    dataIndex: 'date'
                }
            }
            ,begindate: {
                hidden: false
            }
        },
        'Clinical Encounters': {
            parentId: {
                parentConfig: false,
                allowBlank: true
            },
            Id: {
                parentConfig: null,
                hidden: false
            },
            date: {
                parentConfig: null,
                hidden: false,
                label: 'Start Time'
            },
            project: {
                parentConfig: null,
                allowBlank: false,
                hidden: false
            },
            type: {
                hidden: false
            },
            remark: {
                label: 'Procedures or Remarks',
                height: 200,
                width: 600,
                editorConfig: {
                    style: null
                }
            },
            title: {
                parentConfig: {
                    storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
                    ,dataIndex: 'title'
                },
                hidden: true
            }
        },
        'Clinical Remarks': {
            so: {
                hidden: true
            },
            a: {
                hidden: true
            },
            p: {
                hidden: true
            }
        }
    }
};

EHR.ext.Metadata.Request = {
    allQueries: {
        requestid: {
            parentConfig: {
                storeIdentifier:  {queryName: 'requests', schemaName: 'ehr'}
                ,dataIndex: 'requestid'
            }
        },
        date: {
            parentConfig: {
                storeIdentifier:  {queryName: 'requests', schemaName: 'ehr'}
                ,dataIndex: 'daterequested'
            },
            hidden: true,
            editorConfig: {
                minValue: new Date()
            }
        },
        performedby: {
            hidden: true,
            allowBlank: true
        },
        remark: {
            hidden: true
        },
        serviceRequested: {
            xtype: 'textarea'
        },
        daterequested: {
            editorConfig: {
                minValue: new Date()
            }
        }
    },
    byQuery: {
        project: {
            protocol: {
                hidden: true
            },
            avail: {
                hidden: true
            }
        },
        requests: {
            daterequested: {
                xtype: 'datefield'
            }
        },
        'Blood Draws': {
            requestor: {
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            caretaker: {
                hidden: true
            },
            sampleId: {
                hidden: true
            },
            performedby: {
                allowBlank: true
            }
        },
        'Clinical Encounters': {
            title: {
                hidden: true
            },
            performedby: {
                allowBlank: true
            }
        },
        'Drug Administration': {
            performedby: {
                allowBlank: true
            }
        }
    }
};


EHR.ext.Metadata.Assay = {
    allQueries: {
        Id: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
                dataIndex: 'Id'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,date: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
                dataIndex: 'date'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,parentId: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
                dataIndex: 'objectid'
            }
            ,hidden: true
            ,shownInGrid: false
            ,allowBlank: false
        }
        ,project: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
                dataIndex: 'project'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,account: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
                dataIndex: 'account'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,performedby: {
            hidden: true
        }
        ,serviceRequested: {
            xtype: 'displayfield'
        }
    },
    byQuery: {
        'Clinpath Runs': {
            parentId: {
                parentConfig: false,
                allowBlank: true
            },
            Id: {
                parentConfig: null,
                hidden: false
            },
            date: {
                parentConfig: null,
                hidden: false
            },
            project: {
                parentConfig: null,
                allowBlank: false,
                hidden: false
            },
            account: {
                parentConfig: null,
                hidden: false
            }
        }
    }
};


EHR.ext.Metadata.Necropsy = {
    allQueries: {
        Id: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'Id'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,date: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'date'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,begindate: {
            hidden: false
        }
        ,parentId: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'objectid'
            }
            ,hidden: true
            ,shownInGrid: false
            ,allowBlank: false
        }
        ,project: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'project'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,account: {
            parentConfig: {
                storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                dataIndex: 'account'
            }
            ,hidden: true
            ,shownInGrid: false
        }
    },
    byQuery: {
        Necropsies: {
            parentId: {
                parentConfig: false,
                allowBlank: true
            },
            Id: {
                parentConfig: null,
                hidden: false
            },
            date: {
                parentConfig: null,
                hidden: false,
                label: 'Start Time'
            },
            project: {
                parentConfig: null,
                allowBlank: true,
                hidden: false
            },
            account: {
                parentConfig: null,
                allowBlank: false,
                hidden: false
            },
            title: {
                parentConfig: {
                    storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
                    ,dataIndex: 'title'
                }
            },
            caseno: {
                xtype: 'displayfield'
            }
        }
    }
};


EHR.ext.Metadata.Anesthesia = {
//    allQueries: {
//
//    },
    byQuery: {
        'Clinical Observations': {
            area: {
                hidden: true,
                //preventMark: true,
                xtype: 'displayfield',
                allowBlank: true,
                defaultValue: 'Anesthesia'
            }
            ,code: {
                hidden: true
            }
            ,observation: {
                xtype: 'ehr-remoteradiogroup',
                //defaultValue: 'Normal',
                allowBlank: false,
                //includeNullRecord: false,
                editorConfig: {
                    columns: 1
                },
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'observations_anesthesia_recovery',
                    displayColumn: 'value',
                    keyColumn: 'value',
                    sort: 'sort_order'
                }
            }
            ,date: {
                parentConfig: null
                ,hidden: false
                ,shownInGrid: true
            }
        }

    }
};

EHR.ext.Metadata.PE = {
    allQueries: {

    },
    byQuery: {
        'Clinical Observations': {
            area: {
                allowBlank: false,
                includeNullRecord: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pe_region',
                    displayColumn: 'region',
                    keyColumn: 'region',
                    sort: 'region'
                }
            }
        }
    }
};

EHR.ext.hiddenCols = 'lsid,objectid,qcstate,parentid,taskid,requestid';
EHR.ext.topCols = 'id,date,enddate,project,account';
EHR.ext.bottomCols = 'remark,performedBy,'+EHR.ext.hiddenCols;
EHR.ext.sharedCols = EHR.ext.hiddenCols + ',id,date,project,account,remark,performedby';

EHR.ext.FormColumns = {
    Alopecia: EHR.ext.topCols+',score,cause,upperlegs,lowerarms,shoulders,rump,head,upperarms,lowerlegs,hips,dorsum,other,' + EHR.ext.bottomCols,
    'Bacteriology Results': EHR.ext.topCols+',source,result,antibiotic,sensitivity,'+EHR.ext.bottomCols,
    'Blood Chemistry Results': EHR.ext.topCols+',resultOORIndicator,result,units,qualResult,'+EHR.ext.bottomCols,
    'Behavior Remarks': EHR.ext.topCols+',so,a,p,'+EHR.ext.bottomCols,
    Birth: EHR.ext.topCols+',estimated,gender,weight,wdate,dam,sire,room,cage,cond,origin,conception,type,'+EHR.ext.bottomCols,
    'Body Condition': EHR.ext.topCols+',score,weightstatus,' + EHR.ext.bottomCols,
    'Blood Draws': EHR.ext.topCols+',tube_type,tube_vol,num_tubes,quantity,requestor,additionalServices,caretaker,sampleId,remark,performedby,' + EHR.ext.hiddenCols, //p_s,a_v,
    cage_observations: 'room,cage,userId,' + EHR.ext.sharedCols,
    Charges: EHR.ext.topCols+',type,unitCost,quantity,remark,performedby'+EHR.ext.hiddenCols,
    'Chemistry Results': EHR.ext.topCols+',testname,result,units,qualResult,'+EHR.ext.bottomCols,
    'Clinical Encounters': EHR.ext.topCols + ',title,type,serviceRequested,'+EHR.ext.bottomCols,
    'Clinical Remarks': EHR.ext.topCols+',so,a,p,'+EHR.ext.bottomCols,
    'Clinical Observations': EHR.ext.topCols+',area,observation,code,' + EHR.ext.bottomCols,
    'Clinpath Runs': EHR.ext.topCols+',type,serviceRequested,sampleType,sampleId,collectionDate,collectionMethod,collectedBy,sampleQuantity,units,'+EHR.ext.bottomCols,
    'Dental Status': EHR.ext.topCols+',priority,extractions,gingivitis,tartar,' + EHR.ext.bottomCols,
    'Drug Administration': 'id,date,begindate,enddate,project,account,code,route,concentration,conc_units,dosage,dosage_units,amount,amount_units,volume,vol_units,headerdate,remark,performedby,' + EHR.ext.hiddenCols,
    'Hematology Results': EHR.ext.topCols+',testname,result,units,qualResult,'+EHR.ext.bottomCols,
    'Hematology Morphology': EHR.ext.topCols+',morphology,score,'+EHR.ext.bottomCols,
    'Immunology Results': EHR.ext.topCols+',testname,result,units,qualResult,'+EHR.ext.bottomCols,
    'Irregular Observations': EHR.ext.topCols + ',id/curlocation/location,feces,menses,other,tlocation,behavior,otherbehavior,other,breeding,'+EHR.ext.bottomCols,
    Histology: EHR.ext.topCols+',slideNum,tissue,diagnosis,'+EHR.ext.bottomCols,
    'Necropsy Diagnosis': EHR.ext.topCols+',tissue,severity,duration,distribution,process,'+EHR.ext.bottomCols,
    Necropsies: EHR.ext.topCols+',caseno,pathologist,assistant,billing,perfusion_area,perfusion_soln,bcs,'+EHR.ext.bottomCols,
    'Pair Tests': EHR.ext.topCols+',partner,bhav,testno,sharedFood,aggressions,affiliation,conclusion,'+EHR.ext.bottomCols,
    'Parasitology Results': EHR.ext.topCols+',code,'+EHR.ext.bottomCols,
    'Problem List': EHR.ext.topCols+',date_resolved,code,'+EHR.ext.bottomCols,
    'Organ Weights': EHR.ext.topCols+',tissue,weight,'+EHR.ext.bottomCols,
    requests: 'rowid,title,formtype,daterequested,priority,notify1,notify2,pi,createdby,qcstate',
    Restraint: EHR.ext.topCols+',enddate,type,totaltime,'+EHR.ext.bottomCols,
    tasks: 'rowid,title,formtype,created,createdby,assignedto,duedate,taskid,category,qcstate',
    'TB Tests': EHR.ext.topCols + ',lot,dilution,eye,result1,result2,result3,'+EHR.ext.bottomCols,
    'Teeth': EHR.ext.topCols+',jaw,side,tooth,status,' + EHR.ext.bottomCols,
    'Tissue Samples': EHR.ext.topCols+',tissue,diagnosis,'+EHR.ext.bottomCols,
    'Treatment Orders': EHR.ext.topCols+',frequency,code,volume,vunits,conc,cunits,amount,units,route,' + EHR.ext.bottomCols,
    Vitals: EHR.ext.topCols+',temp,heartrate,resprate,' + EHR.ext.bottomCols,
    Weight: EHR.ext.topCols + ',weight,'+EHR.ext.bottomCols
};
