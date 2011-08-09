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
//            colModel: {
//                showLink: false
//            }
        },
        Id: {
            xtype: 'ehr-participant',
            dataIndex: 'Id',
            nullable: false,
            allowBlank: false,
            lookups: false,
            colModel: {
                width: 70
                ,showLink: false
            },
            noDuplicateByDefault: true
        },
        'id/curlocation/location': {
            hidden: true,
            allowBlank: true,
            nullable: true,
            shownInGrid: true,
            caption: 'Location',
            header: 'Location',
            lookups: false,
            allowDuplicateValue: false,
            colModel: {
                width: 70,
                showLink: false
            }
        }
        ,'id/numroommates/cagemates': {
            hidden: true,
            allowBlank: true,
            nullable: true,
            shownInGrid: true,
            caption: 'Animals In Cage',
            header: 'Animals In Cage',
            lookups: false,
            allowDuplicateValue: false,
            colModel: {
                width: 120,
                showLink: false
            }
        }
        ,date: {
            allowBlank: false,
            nullable: false,
            noDuplicateByDefault: true,
            format: 'Y-m-d H:i',
            editorConfig: {
                dateFormat: 'Y-m-d',
                otherToNow: true,
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
        ,room: {
            editorConfig: {listWidth: 200}
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
            shownInInsertView: true,
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
        ,cage: {
            editorConfig: {
                listeners: {
                    change: function(field, val){
                        if(val && !isNaN(val)){
                            var newVal = EHR.utils.padDigits(val, 4);
                            if(val != newVal)
                                field.setValue(newVal);
                        }
                    }
                }
            }
        }
        ,code: {
            xtype: 'ehr-snomedcombo'
            //,lookups: false
            ,colModel: {
                width: 150
                ,showLink: false
            }
//            ,getRenderer: function(col, meta){
//                return function(data, cellMetaData, record, rowIndex, colIndex, store) {
//                    var storeId = ['ehr_lookups', 'snomed', 'code', 'meaning', store.queryName, (meta.dataIndex || meta.name)].join('||');
//                    var lookupStore = Ext.StoreMgr.get(storeId);
//
//                    if(!lookupStore)
//                        return '';
//
//                    var idx = lookupStore.find('code', data);
//                    var lookupRecord;
//                    if(idx != -1)
//                        lookupRecord = lookupStore.getAt(idx);
//
//                    if (lookupRecord)
//                        return lookupRecord.data['meaning'] || lookupRecord.data['code/meaning'];
//                    else if (data)
//                        return "[" + data + "]";
//                    else
//                        return meta.lookupNullCaption || "[none]";
//                }
//            }
        }
        ,tissue: {
            xtype: 'ehr-snomedcombo',
            editorConfig: {
                defaultSubset: 'Organ/Tissue'
            }
        }
        ,performedby: {
            colModel: {
                width: 65
            }
            ,shownInGrid: false
        }
        ,userid: {
            lookup: {
                schemaName: 'core',
                queryName: 'users',
                displayColumn: 'name',
                keyColumn: 'name',
                sort: 'Email'
            }
            ,formEditorConfig:{readOnly: true}
            ,editorConfig: {listWidth: 200}
            ,defaultValue: LABKEY.Security.currentUser.displayName
            ,shownInGrid: false
        }
        ,CreatedBy: {
            hidden: false
            ,shownInInsertView: true
            ,xtype: 'displayfield'
            ,shownInGrid: false
        }
        ,ModifiedBy: {
            hidden: false
            ,shownInInsertView: true
            ,xtype: 'displayfield'
            ,shownInGrid: false
        }
        ,AnimalVisit: {hidden: true}
        //,CreatedBy: {hidden: true, shownInGrid: false}
        //,ModifiedBy: {hidden: true, shownInGrid: false, useNull: true}
        ,SequenceNum: {hidden: true}
        ,Description: {hidden: true}
        ,Dataset: {hidden: true}
        //,category: {hidden: true}
        ,QCState: {
            allowBlank: false,
            noDuplicateByDefault: true,
            noSaveInTemplateByDefault: true,
            setInitialValue: function(v){
                var qc;
                if(!v && EHR.permissionMap && EHR.permissionMap.qcMap && EHR.permissionMap.qcMap.label['In Progress'])
                    qc = EHR.permissionMap.qcMap.label['In Progress'].RowId;
                return v || qc;
            },
            shownInGrid: false,
            hidden: false,
            editorConfig: {
                editable: false,
                listWidth: 200,
                disabled: true
            },
            colModel: {
                width: 70
            }
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
            isAutoExpandColumn: true,
            printWidth: 150
//            editorConfig: {
//                style: 'width: 100%;max-width: 600px;min-width: 200px;'
//            }
        }
        ,project: {
            xtype: 'ehr-project'
            ,editorConfig: {
                defaultProjects: [00300901]
            }
            ,shownInGrid: false
            ,useNull: true
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
                setInitialValue: function(v){
                    var qc;
                    if(EHR.permissionMap && EHR.permissionMap.qcMap && EHR.permissionMap.qcMap.label['In Progress'])
                        qc = EHR.permissionMap.qcMap.label['In Progress'].RowId;
                    return v || qc;
                },
                shownInGrid: false,
                parentConfig: false,
                hidden: false,
                editorConfig: {
                    disabled: true,
                    editorConfig: {listWidth: 200}
                }
            },
            assignedto: {
                useNull: true,
                setInitialValue: function(val){
                    return val || LABKEY.Security.currentUser.id
                },
                lookup: {
                    sort: 'type,name'
                },
                editorConfig: {listWidth: 200}
            },
            duedate: {
                xtype: 'xdatetime',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                },
                setInitialValue: function(val){
                    return val || new Date();
                }
            },
            category: {
                hidden: true
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
                defaultValue: LABKEY.Security.currentUser.id,
                lookup: {
                    sort: 'type,name',
                    filterArray: [LABKEY.Filter.create('name', 'Administrators', LABKEY.Filter.Types.NOT_EQUAL)]
                },
                listWidth: 250
            },
            notify2: {
                lookup: {
                    sort: 'type,name',
                    filterArray: [LABKEY.Filter.create('name', 'Administrators', LABKEY.Filter.Types.NOT_EQUAL)]
                },
                listWidth: 250
            },
            daterequested: {
                xtype: 'xdatetime',
                hidden: true
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
                setInitialValue: function(v){
                    var qc;
                    if(!v && EHR.permissionMap && EHR.permissionMap.qcMap && EHR.permissionMap.qcMap.label['In Progress'])
                        qc = EHR.permissionMap.qcMap.label['Request: Pending'].RowId;
                    return v || qc;
                },
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
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Culture Source'
                }
            },
//            result: {
//                xtype: 'ehr-snomedcombo',
//                editorConfig: {
//                    defaultSubset: 'Bacteriology Results'
//                }
//            },
            organism: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Organisms'
                }
            },
            antibiotic: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Antibiotic'
                }
            },
            sensitivity: {
                shownInGrid: false
            },
            result: {
                shownInGrid: false
            },
            units: {
                shownInGrid: false
            },
            date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            }
        },
        Demographics: {
            Id: {
//                xtype: 'trigger'
                allowBlank: false
                ,editorConfig: {
//                    triggerClass: 'x-form-search-trigger',
                    allowAnyId: true
//                    ,onTriggerClick: function (){
//                        var prefix = this.getValue();
//
//                        if(!prefix){
//                            Ext.Msg.alert('Error', "Must enter prefix");
//                            return
//                        }
//                        var sql = "SELECT max(cast(regexp_replace(SUBSTRING(Id, "+(prefix.length+1)+", 6), '[a-z\-]+', '') as integer)) as maxNumber FROM study.Demographics WHERE Id LIKE '" + prefix + "%' AND lcase(SUBSTRING(Id, "+(prefix.length+1)+", 6)) = ucase(SUBSTRING(Id, "+(prefix.length+1)+", 6))";
//
//                        LABKEY.Query.executeSql({
//                            schemaName: 'study',
//                            sql: sql,
//                            scope: this,
//                            success: function(data){
//                                var number;
//                                if(data.rows && data.rows.length==1){
//                                    number = Number(data.rows[0].maxNumber)+1;
//                                }
//                                else {
//                                    console.log('no mstching IDs found');
//                                    number = 1;
//                                }
//
//                                number = EHR.utils.padDigits(number, (6-prefix.length));
//                                var id = prefix + number;
//                                this.setValue(id.toLowerCase());
//                            },
//                            failure: EHR.onFailure
//                        });
//                    }
                }
            },
            project: {hidden: true},
            performedby: {hidden: true},
            account: {hidden: true},
            species: {allowBlank: false},
            gender: {allowBlank: false}
        },
        Prenatal: {
            Id: {
                editorConfig: {
                    allowAnyId: true
                }
            },
            sire: {lookups: false},
            dam: {lookups: false},
            project: {hidden: true},
            performedby: {hidden: true},
            account: {hidden: true}
        },
        'Parasitology Results': {
            organism: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Parasitology Results'
                }
            }
            ,date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            }
        },
        'Tissue Samples': {
            diagnosis: {
                xtype: 'ehr-snomedcombo'
            },
            performedby: {
                hidden: true
            }
        },
        Histology: {
            diagnosis: {
                xtype: 'ehr-snomedcombo'
            },
            slideNum: {
//                setInitialValue: function(v, rec){
//                    var idx = Ext.StoreMgr.get('study||Histology||||').getCount()+1;
//                    return v || idx;
//                }
            },
            performedby: {
                hidden: true
            }
        },
        Housing: {
            date: {
                editorConfig: {
                    allowNegative: false
//                    ,listeners: {
//                        change: function(field, val){
//                            var form = this.ownerCt.getForm();
//                            var rec = this.ownerCt.boundRecord;
//                            if(rec && rec.store){
//
//                            }
//                        }
//                    }
                }
            }
            ,enddate: {
                //hidden: true
                xtype: 'xdatetime',
                format: 'Y-m-d H:i',
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
            ,performedby: {
                shownInGrid: false
                //,allowBlank: false
            }
            ,cage: {
                allowBlank: false
            }
            ,cond: {
                allowBlank: false
                ,shownInGrid: false
            }
            ,reason: {
                shownInGrid: false
            }
            ,restraintType: {
                shownInGrid: false
            }
            ,cagesJoined: {
                shownInGrid: false
            }
            ,isTemp: {
                shownInGrid: false
            }
            ,project: {
                hidden: true
            }
        },
        'Clinical Encounters': {
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
            ,serviceRequested: {
                xtype: 'displayfield'
                ,editorConfig: {
                    height: 100
                }
            }
            ,performedby: {
                allowBlank: false
            }
            ,type: {
                allowBlank: false
            }
        },
        'Clinical Remarks': {
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            remark: {
                hidden: true
            },
            date: {
                setInitialValue: function(v, rec)
                {
                    return v ? v : (new Date((new Date().toDateString())));
                }
                ,noDuplicateByDefault: false
            },
            account: {
                hidden: true
            },
            so: {
                shownInGrid: false,
                //width: 300,
                height: 150
            },
            a: {
                shownInGrid: false,
                height: 150
            },
            p: {
                shownInGrid: false,
                height: 150
            }
//            userid: {
//                defaultValue: LABKEY.Security.currentUser.displayName
//            }

        },
        'Clinpath Runs': {
            collectionMethod : {shownInGrid: false},
            //collectedBy : {shownInGrid: false},
            //sampleType : {shownInGrid: false},
            sampleId : {shownInGrid: false},
            sampleQuantity: {shownInGrid: false},
            quantityUnits : {shownInGrid: false},
            serviceRequested: {
                allowBlank: false,
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            theForm.findField('type').setValue(rec.get('dataset'));
                        }
                    }
                },
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'clinpath_tests',
                    displayColumn: 'testname',
                    keyColumn: 'testname',
                    sort: 'testname',
                    columns: '*'
                }
            },
            project: {
                allowBlank: true,
                nullable: true
            },
            account: {
                allowBlank: false
            },
            source: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Organisms'
                }
            },
            type: {
                showInGrid: false
            },
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
        },
        'Dental Status': {
            gingivitis: {allowBlank: false, editorConfig: {lookupNullCaption: 'N/A'}},
            tartar: {allowBlank: false, lookupNullCaption: 'N/A'},
            performedby: {
                hidden: true
            }
        },
        'Treatment Orders': {
            date: {
                xtype: 'datefield',
                format: 'Y-m-d',
                allowBlank: false,
                setInitialValue: function(v, rec)
                {
                    return v ? v : new Date()
                },
                colModel: {
                    fixed: true,
                    width: 110
                },
                shownInGrid: true
            }
            ,enddate: {
                xtype: 'datefield',
                format: 'Y-m-d',
                colModel: {
                    fixed: true,
                    width: 110
                }
                //shownInGrid: false
            }
            ,project: {
                allowBlank: false
            }
            ,CurrentRoom: {lookups: false}
            ,CurrentCage: {lookups: false}
            ,volume: {
                compositeField: 'Volume',
                xtype: 'ehr-triggernumberfield',
                noDuplicateByDefault: true,
                noSaveInTemplateByDefault: true,
                editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function (){
                        //recalculate amount if needed:
                        var theForm = this.findParentByType('ehr-formpanel').getForm();
                        var conc = theForm.findField('concentration').getValue();
                        var val = this.getValue();

                        if(!val || !conc){
                            alert('Must supply volume and concentration');
                            return;
                        }

                        if(val && conc){
                            var amount = conc * val;
                            theForm.findField('amount').setValue(amount);
                        }
                    }
                    ,decimalPrecision: 3
                }
            }
            ,vol_units: {
                compositeField: 'Volume'
//                editorConfig: {
//                    fieldLabel: null
//                }
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
            ,amount: {
                compositeField: 'Amount'
                ,noDuplicateByDefault: true
                ,noSaveInTemplateByDefault: true
                //,allowBlank: false
                ,shownInGrid: false
                ,colModel: {
                    width: 40
                }
                ,editorConfig: {
                    decimalPrecision: 3
                }
            }
            ,amount_units: {
                shownInGrid: false
                ,compositeField: 'Amount'
                ,colModel: {
                    width: 70
                }
            }
            ,route: {shownInGrid: false}
            ,frequency: {
                allowBlank: false
                ,lookup: {
                    sort: 'sort_order'
                    ,columns: '*'

                }
            }
            ,dosage: {
                xtype: 'ehr-drugdosefield',
                shownInGrid: false,
                compositeField: 'Dosage',
                editorConfig: {
                    decimalPrecision: 3
                }
            }
            ,dosage_units: {
                shownInGrid: false,
                compositeField: 'Dosage'
            }
            ,code: {
                //shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
                }
            }
            ,qualifier: {
                shownInGrid: false
            }
            ,meaning: {
                shownInGrid: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'treatment_codes',
                    displayColumn: 'meaning',
                    keyColumn: 'meaning',
                    sort: 'category,meaning',
                    columns: '*'
                }
                ,editorConfig: {
                    tpl : function()
                    {
                        var tpl = new Ext.XTemplate(
                                '<tpl for=".">' +
                                        '<div class="x-combo-list-item">{[ values["category"] ? "<b>"+values["category"]+":</b> "  : "" ]}{[ values["meaning"] ]}' +
                                        '&nbsp;</div></tpl>'
                                );
                        return tpl.compile()
                    }(),
                    listeners: {
                        select: function(combo, rec){
                            var theForm = this.findParentByType('ehr-formpanel').getForm();

                            theForm.findField('route').setValue(rec.get('route'));
                            theForm.findField('qualifier').setValue(rec.get('qualifier'));
                            theForm.findField('code').setValue(rec.get('code'));
                            theForm.findField('frequency').setValue(rec.get('frequency'));

                            theForm.findField('amount_units').setValue(rec.get('amount_units'));
                            theForm.findField('conc_units').setValue(rec.get('conc_units'));
                            theForm.findField('vol_units').setValue(rec.get('vol_units'));
                            theForm.findField('dosage_units').setValue(rec.get('dosage_units'));

                            theForm.findField('amount').setValue(rec.get('amount'));
                            theForm.findField('concentration').setValue(rec.get('concentration'));
                            theForm.findField('volume').setValue(rec.get('volume'));

                            var doseField = theForm.findField('dosage');
                            doseField.setValue(rec.get('dosage'));
                            doseField.fireEvent('change', doseField.getValue(), doseField.startValue);
                        }
                    }
                }
            }
            ,remark: {
                shownInGrid: false
            }
            ,performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName
            }
        },
        Project: {
            project: {
                xtype: 'textfield',
                lookups: false
            }
        },
        Assignment: {
            project: {
                shownInGrid: true,
                xtype: 'combo',
                lookup: {
                    filterArray: [LABKEY.Filter.create('protocol/protocol', null, LABKEY.Filter.Types.NONBLANK)]
                }
            },
            date: {
                xtype: 'datefield',
                format: 'Y-m-d'
            },
            enddate: {
                xtype: 'datefield',
                format: 'Y-m-d'
            }
        },
        Necropsies: {
            remark: {
                height: 200,
                width: 600
            },
            perfusion_soln1: {
//                xtype: 'lovcombo',
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                },
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'necropsy_perfusion',
                    keyColumn: 'perfusion',
                    displayColumn: 'perfusion'
                }
            },
            perfusion_soln2: {
//                xtype: 'lovcombo',
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                },
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'necropsy_perfusion',
                    keyColumn: 'perfusion',
                    displayColumn: 'perfusion'
                }
            },
            perfusion_time1: {
                xtype: 'xdatetime',
                format: 'Y-m-d H:i',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                }
            },
            perfusion_time2: {
                xtype: 'xdatetime',
                format: 'Y-m-d H:i',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                }
            },
            timeofdeath: {
                xtype: 'xdatetime',
                format: 'Y-m-d H:i',
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                }
            },
            grossdescription: {
                height: 200,
                width: 600,
                defaultValue: 'A ___ kg rhesus macaque is presented for necropsy in excellent post mortem condition.\n\nA ___ kg cynomolgus macaque is presented for necropsy in excellent post mortem condition.\n\nA ___ kg common marmoset is presented for necropsy in excellent post mortem condition.\n\nA ____ kg cynomolgus macaque is presented for perfusion and necropsy in excellent post mortem condition.\n\nA ____ kg rhesus macaque is presented for perfusion and necropsy in excellent post mortem condition.'
            },
            caseno: {
                xtype: 'trigger'
                ,allowBlank: false
                ,editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function(){
                        var theWin = new Ext.Window({
                            layout: 'form'
                            ,title: 'Case Number'
                            ,bodyBorder: true
                            ,border: true
                            ,theField: this
                            //,frame: true
                            ,bodyStyle: 'padding:5px'
                            ,width: 350
                            ,defaults: {
                                width: 200,
                                border: false,
                                bodyBorder: false
                            }
                            ,items: [
                                {
                                    xtype: 'textfield',
                                    ref: 'prefix',
                                    fieldLabel: 'Prefix',
                                    allowBlank: false,
                                    value: 'c'
                                },{
                                    xtype: 'numberfield',
                                    ref: 'year',
                                    fieldLabel: 'Year',
                                    allowBlank: false,
                                    value: (new Date()).getFullYear()
                                }
                            ],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                ref: '../submit',
                                //scope: this,
                                handler: function(p){
                                    getCaseNo(p.ownerCt.ownerCt);
                                    this.ownerCt.ownerCt.hide();
                                }
                            },{
                                text: 'Close',
                                //scope: this,
                                handler: function(){
                                    this.ownerCt.ownerCt.hide();
                                }
                            }]
                        });
                        theWin.show();

                        function getCaseNo(panel){
                            var year = panel.year.getValue();
                            var prefix = panel.prefix.getValue();

                            if(!year || !prefix){
                                Ext.Msg.alert('Error', "Must supply both year and prefix");
                                return
                            }

                            LABKEY.Query.executeSql({
                                schemaName: 'study',
                                sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study.Necropsies WHERE caseno LIKE '" + year + prefix + "%'",
                                scope: this,
                                success: function(data){
                                    var caseno;
                                    if(data.rows && data.rows.length==1){
                                        caseno = data.rows[0].caseno;
                                        caseno++;
                                    }
                                    else {
                                        console.log('no existing cases found');
                                        caseno = 1;
                                    }

                                    caseno = EHR.utils.padDigits(caseno, 3);
                                    var val = year + prefix + caseno;
                                    panel.theField.setValue(val);
                                    panel.theField.fireEvent('change', val)
                                },
                                failure: EHR.onFailure
                            });
                        };
                    }
                }
            },
            performedby: {
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                }
            },
            assistant: {
                xtype: 'lovcombo',
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                }
            },
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
        },
        Biopsies: {
            remark: {
                height: 200,
                width: 600
            },
            grossdescription: {
                height: 200,
                width: 600
            },
            caseno: {
                xtype: 'trigger'
                ,allowBlank: false
                ,editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function(){
                        var theWin = new Ext.Window({
                            layout: 'form'
                            ,title: 'Case Number'
                            ,bodyBorder: true
                            ,border: true
                            ,theField: this
                            //,frame: true
                            ,bodyStyle: 'padding:5px'
                            ,width: 350
                            ,defaults: {
                                width: 200,
                                border: false,
                                bodyBorder: false
                            }
                            ,items: [
                                {
                                    xtype: 'textfield',
                                    ref: 'prefix',
                                    fieldLabel: 'Prefix',
                                    allowBlank: false,
                                    value: 'b'
                                },{
                                    xtype: 'numberfield',
                                    ref: 'year',
                                    fieldLabel: 'Year',
                                    allowBlank: false,
                                    value: (new Date()).getFullYear()
                                }
                            ],
                            buttons: [{
                                text:'Submit',
                                disabled:false,
                                ref: '../submit',
                                //scope: this,
                                handler: function(p){
                                    getCaseNo(p.ownerCt.ownerCt);
                                    this.ownerCt.ownerCt.hide();
                                }
                            },{
                                text: 'Close',
                                //scope: this,
                                handler: function(){
                                    this.ownerCt.ownerCt.hide();
                                }
                            }]
                        });
                        theWin.show();

                        function getCaseNo(panel){
                            var year = panel.year.getValue();
                            var prefix = panel.prefix.getValue();

                            if(!year || !prefix){
                                Ext.Msg.alert('Error', "Must supply both year and prefix");
                                return
                            }

                            LABKEY.Query.executeSql({
                                schemaName: 'study',
                                sql: "SELECT cast(SUBSTRING(MAX(caseno), 6, 8) AS INTEGER) as caseno FROM study.Necropsies WHERE caseno LIKE '" + year + prefix + "%'",
                                scope: this,
                                success: function(data){
                                    var caseno;
                                    if(data.rows && data.rows.length==1){
                                        caseno = data.rows[0].caseno;
                                        caseno++;
                                    }
                                    else {
                                        console.log('no existing cases found');
                                        caseno = 1;
                                    }

                                    caseno = EHR.utils.padDigits(caseno, 3);
                                    var val = year + prefix + caseno;
                                    panel.theField.setValue(val);
                                    panel.theField.fireEvent('change', val)
                                },
                                failure: EHR.onFailure
                            });
                        };
                    }
                }
            },
            performedby: {
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'pathologists',
                    displayColumn: 'UserId',
                    keyColumn: 'UserId'
                }
            },
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
        },
        'Morphologic Diagnosis': {
            duration: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Duration'
                }
            },
            severity: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Severity Codes'
                }
            },
            etiology: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Etiology'
                }
            },
            distribution2: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Distribution'
                }
            },
            inflammation: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Inflammation'
                }
            },
            distribution: {
                xtype: 'ehr-snomedcombo',
                shownInGrid: false,
                editorConfig: {
                    defaultSubset: 'Distribution'
                }
            },
            process: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Process/Disorder'
                }
            },
            process2: {
                xtype: 'ehr-snomedcombo',
                editorConfig: {
                    defaultSubset: 'Process/Disorder'
                }
            },
            performedby: {
                hidden: true
            },
            remark: {
                shownInGrid: false
            }
        },
        'Organ Weights': {
            performedby: {
                hidden: true
            },
            weight: {
                allowBlank: false,
                editorConfig: {
                    decimalPrecision: 3
                }
            }
        },
        'Body Condition': {
            performedby: {hidden: true},
            weightStatus: {
                xtype: 'ehr-booleancombo',
                defaultValue: false
//                setInitialValue: function(v){
//                    return v || false;
//                }
            }
        },
        Alopecia: {
            head: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            dorsum: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            rump: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            shoulders: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            upperArms: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            lowerArms: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            hips: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            upperLegs: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            lowerLegs: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
            other: {xtype: 'ehr-remoteradiogroup', includeNullRecord: false, defaultValue: 'No', formEditorConfig: {columns: 3}},
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
                allowBlank: true,
                formEditorConfig: {
                    storeCfg: {
                        schemaName: 'ehr_lookups',
                        queryName: 'obs_remarks',
                        valueField: 'remark',
                        displayField: 'title'
                    }
                }
            },
            feces: {
                shownInGrid: true,
                xtype: 'ehr-remotecheckboxgroup', includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_feces', displayColumn: 'meaning', keyColumn: 'code'}
            },
            no_observations: {
                shownInGrid: false,
                formEditorConfig: {
                    listeners: {
                        check: function(field, val){
                            var theForm = this.ownerCt.getForm();
                            if(theForm){
                                var rfield = theForm.findField('remark');

                                if(val)
                                    rfield.setValue('ok');
                                else if (rfield.getValue()=='ok')
                                    rfield.setValue('');

                                theForm.findField('feces').setValue();
                            }
                        }
                    }
                }
            }
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
        'Chemistry Results': {
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
                compositeField: 'Result',
                editorConfig: {
                    decimalPrecision: 4
                }
            }
            ,testid: {
                lookup: {columns: '*'},
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            }
            ,date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            }
        },
        'Immunology Results': {
            testid: {
                lookup: {columns: '*'},
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            }
            ,date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            }
        },
        'Hematology Results': {
            testid: {
                lookup: {columns: '*'},
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            }
            ,date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            }
        },
        'Urinalysis Results': {
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
                ,editorConfig: {
                    decimalPrecision: 4
                }
            }
            ,testid: {
                lookup: {columns: '*'},
                editorConfig: {
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(combo, rec)
                        {
                            var theForm = this.findParentByType('ehr-formpanel').getForm();
                            var unitField = theForm.findField('units');
                            unitField.setValue(rec.get('units'));
                            unitField.fireEvent('change', unitField.getValue(), unitField.startValue);
                        }
                    }
                }
            }
            ,date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            }
        },
        'Virology Results': {
            date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            }
        },
        'Hematology Morphology': {
            date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            }
        },
        'Irregular Observations': {
            RoomAtTime: {hidden: true}
            ,date: {
                editorConfig: {
                    minValue: new Date()
                }
            }
            ,CageAtTime: {
                hidden: true,
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            if(val && !isNaN(val)){
                                var newVal = EHR.utils.padDigits(val, 4);
                                if(val != newVal)
                                    field.setValue(newVal);
                            }
                        }
                    }
                }
            }
            ,feces: {
                shownInGrid: true,
                xtype: 'ehr-remotecheckboxgroup', includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_feces', displayColumn: 'meaning', keyColumn: 'code'}
            }
            ,menses: {
                shownInGrid: true,
                xtype: 'ehr-remoteradiogroup',
                defaultValue: null,
                value: null,
                includeNullRecord: true,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_mens', displayColumn: 'meaning', keyColumn: 'code'}
            }
            ,other: {
                shownInGrid: true,
                xtype: 'ehr-remotecheckboxgroup',
                includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_other', displayColumn: 'meaning', keyColumn: 'code'}
            }
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
            ,breeding: {
                shownInGrid: false,
                xtype: 'ehr-remotecheckboxgroup',
                includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_breeding', displayColumn: 'meaning', keyColumn: 'code'}
            }
            ,project: {hidden: true}
            ,account: {hidden: true}
            ,performedby: {
                allowBlank: true,
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            }
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
            ,behavior: {
                shownInGrid: false,
                xtype: 'ehr-remotecheckboxgroup',
                includeNullRecord: false,
                formEditorConfig: {columns: 1},
                lookup: {schemaName: 'ehr_lookups', queryName: 'obs_behavior', displayColumn: 'meaning', keyColumn: 'code'}
            }
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
//        'Clinpath Requests': {
//            dateCompleted: {hidden: true}
//            ,status: {hidden: true}
//            ,requestor: {defaultValue: LABKEY.Security.currentUser.email}
//            ,notify1: {shownInGrid: false}
//            ,notify2: {shownInGrid: false}
//
//        },
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
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            project: {hidden: true},
            account: {hidden: true},
            remark: {
                hidden: true
            },
            so: {
                shownInGrid: false
            },
            a: {
                shownInGrid: false
            },
            p: {
                shownInGrid: false
            }
        },
        Arrival: {
            Id: {
                editorConfig: {allowAnyId: true}
            },
            project: {hidden: true},
            account: {hidden: true},
            source: {allowBlank: false},
            performedby: {hidden: true},
            remark: {shownInGrid: false},
            dam: {shownInGrid: false},
            sire: {shownInGrid: false},
            initialRoom: {hidden: false},
            initialCage: {
                hidden: false,
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            if(val && !isNaN(val)){
                                var newVal = EHR.utils.padDigits(val, 4);
                                if(val != newVal)
                                    field.setValue(newVal);
                            }
                        }
                    }
                }
            },
            initialCond: {hidden: false}
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
            performedby: {hidden: true},
            tooth: {
                lookup: {
                    columns: '*',
                    sort: 'seq_order'
                }
            }
        },
        Deaths: {
            performedby: {
                hidden: false,
                defaultValue: LABKEY.Security.currentUser.displayName
            },
            project: {hidden: true},
            account: {hidden: true},
            necropsy: {lookups: false},
            cause: {allowBlank: true},
            tattoo: {
                editorConfig: {
                    helpPopup: 'Please enter the color and number of the tag and/or all visible tattoos'
                }
            }
            //manner: {allowBlank: false}
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
            dam: {shownInGrid: false, lookups: false},
            sire: {shownInGrid: false, lookups: false},
            gender: {includeNullRecord: false, allowBlank: false},
            weight: {shownInGrid: false},
            wdate: {shownInGrid: false},
            room: {shownInGrid: false},
            cage: {shownInGrid: false},
            cond: {shownInGrid: false},
            origin: {shownInGrid: false},
            estimated: {shownInGrid: false},
            conception: {shownInGrid: false}
        },
        'Blood Draws' : {
            billedby: {shownInGrid: false}
            ,remark: {shownInGrid: false}
            ,project: {shownInGrid: false, allowBlank: false}
            ,requestor: {shownInGrid: false, formEditorConfig:{readOnly: true}}
            ,performedby: {shownInGrid: false}
            ,assayCode: {
                xtype: 'trigger'
                ,shownInGrid: false
                ,editorConfig: {
                    triggerClass: 'x-form-search-trigger',
                    allowAnyId: true
                    ,onTriggerClick: function (){
                        var prefix = this.getValue();

                        if(!prefix){
                            Ext.Msg.alert('Error', "Must enter prefix");
                            return
                        }
                        var sql = "SELECT max(cast(regexp_replace(SUBSTRING(assayCode, "+(prefix.length+1)+"), '[a-z\-]+', '') as integer)) as maxNumber FROM study.blood WHERE assayCode LIKE '" + prefix + "%'  AND lcase(SUBSTRING(assayCode, "+(prefix.length+1)+")) = ucase(SUBSTRING(assayCode, "+(prefix.length+1)+"))";
                        //console.log(sql)
                        LABKEY.Query.executeSql({
                            schemaName: 'study',
                            sql: sql,
                            scope: this,
                            success: function(data){
                                var number;
                                if(data.rows && data.rows.length==1){
                                    number = Number(data.rows[0].maxNumber)+1;
                                }
                                else {
                                    console.log('no matching IDs found');
                                    number = 1;
                                }

                                //number = EHR.utils.padDigits(number, (6-prefix.length));
                                var id = prefix + number;
                                this.setValue(id.toLowerCase());
                                this.fireEvent('change', this.getValue());
                            },
                            failure: EHR.onFailure
                        });
                    }
                }
            }
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
                    plugins: ['ehr-usereditablecombo'],
                    listeners: {
                        select: function(field, rec){
                            var theForm = this.ownerCt.getForm();
                            var tube_vol = theForm.findField('tube_vol');

                            tube_vol.store.baseParams['query.tube_types~contains'] = rec.get('type');
                            tube_vol.store.load();
                        }
                    }
                }
            }
            ,quantity: {
                //xtype: 'displayfield',
                shownInGrid: false,
                allowBlank: false,
                editorConfig: {
                    allowNegative: false,
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
                xtype: 'ehr-triggernumberfield'
                ,editorConfig: {
                    allowNegative: false
                    ,triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function(){
                        var parent = this.findParentByType('ehr-formpanel');
                        var theForm = parent.getForm();

                        var tube_vol = theForm.findField('tube_vol');

                        if(!tube_vol.getValue() || !this.getValue()){
                            Ext.Msg.alert('Error', 'Must enter tube volume and number of tubes');
                            return;
                        }

                        var quantity = tube_vol.getValue() * this.getValue();
                        theForm.findField('quantity').setValue(quantity);
                    }
                }
                ,allowBlank: true
            }
            ,tube_vol: {
                shownInGrid: true
                ,allowBlank: false
                ,editorConfig: {
                    plugins: ['ehr-usereditablecombo']
//                    ,listeners: {
//                        select: function(field, rec){
//                            var theForm = this.ownerCt.getForm();
//                        }
//                    }
                }
                ,includeNullRecord: false
                ,lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_tube_volumes',
                    displayColumn: 'volume',
                    keyColumn: 'volume',
                    columns: '*',
                    sort: 'volume'
                }


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
                shownInGrid: false,
                hidden: false,
                shownInInsertView: true,
                label: 'End Time'
            }
            ,category: {
                hidden: true
            }
            ,code: {
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
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
                compositeField: 'Dosage',
                editorConfig: {
                    decimalPrecision: 3
                }
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
                compositeField: 'Volume',
                xtype: 'ehr-triggernumberfield',
                noDuplicateByDefault: true,
                noSaveInTemplateByDefault: true,
                editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function (){
                        //recalculate amount if needed:
                        var theForm = this.findParentByType('ehr-formpanel').getForm();
                        var conc = theForm.findField('concentration').getValue();
                        var val = this.getValue();

                        if(!val || !conc){
                            alert('Must supply volume and concentration');
                            return;
                        }

                        if(val && conc){
                            var amount = conc * val;
                            theForm.findField('amount').setValue(amount);
                        }
                    }
                    ,decimalPrecision: 3
                }
            }
            ,vol_units: {
                compositeField: 'Volume'
                ,header: 'Units'
//                editorConfig: {
//                    fieldLabel: null
//                }
            }
            ,amount: {
                compositeField: 'Amount Given'
                ,noDuplicateByDefault: true
                ,noSaveInTemplateByDefault: true
                //,allowBlank: false
                ,shownInGrid: false
                ,colModel: {
                    width: 40
                }
                ,editorConfig: {
                    decimalPrecision: 10
                }
            }
            ,amount_units: {
                shownInGrid: false
                ,compositeField: 'Amount Given'
                ,colModel: {
                    width: 70
                }
            }
            ,performedby: {
                allowBlank: false
            }
            ,project: {
                allowBlank: false
            }
            ,restraint: {
                shownInGrid: false
            }
            ,restraintTime: {
                shownInGrid: false
            }
            ,qualifier: {
                shownInGrid: false
            }
        },
        Notes: {
            performedby: {hidden: true},
            project: {hidden: true},
            account: {hidden: true}
        },
        'Problem List': {
            date: {
                xtype: 'datefield',
                format: 'Y-m-d'
            },
            enddate: {
                xtype: 'datefield',
                format: 'Y-m-d'
            },
            project: {hidden: true},
            account: {hidden: true},
            performedby: {hidden: true},
            code: {hidden: true},
            problem_no: {shownInInsertView: false}
        },
        'Clinical Observations': {
            observation: {
                xtype: 'ehr-remoteradiogroup',
                //defaultValue: 'Normal',
                //allowBlank: false,
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
            project: {
                hidden: true
            },
            account: {
                hidden: true
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
            },
            date: {
                xtype: 'datefield',
                format: 'Y-m-d'
            }
        },
        Weight: {
            project: {
                hidden: true
            }
            ,account: {
                hidden: true
            }
            ,performedby: {
                hidden: true
            }
            ,'id/curlocation/location': {
                shownInGrid: true
            }
            ,remark: {
                shownInGrid: false
            }
            ,weight: {
                allowBlank: false
                ,useNull: true
                ,editorConfig: {
                    allowNegative: false
                    ,decimalPrecision: 4
                }
            }
            //,performedby: {allowBlank: true}
        }
    }
};

EHR.ext.Metadata.Task = {
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
            requestor:{xtype: 'displayfield'}
        }
        ,Deaths: {
            cause: {
                hidden: true
            }
        }
    }
};

EHR.ext.Metadata.SimpleForm = {
    allQueries: {
        QCState: {
//            parentConfig: {
//                storeIdentifier: {queryName: 'tasks', schemaName: 'ehr'},
//                dataIndex: 'qcstate'
//            }
            hidden: true
            //,defaultValue: 2
            ,editorConfig: {
                editable: true,
                disabled: false
            }
        }
        ,taskid: {
//            parentConfig: {
//                storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'}
//                ,dataIndex: 'taskid'
//            }
            hidden: true
        }
    },
    byQuery: {
        tasks: {
            category: {
                defaultValue: 'Generic Form'
            }
        },
        'Clinical Remarks': {
            remark: {
                hidden: true
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
                ,allowBlank: false
            }
            ,performedby: {
                allowBlank: true,
                hidden: true
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
//            so: {
//                hidden: true
//            },
//            a: {
//                hidden: true
//            },
//            p: {
//                hidden: true
//            }
            remark: {
                label: 'Other Remark'
            }
        },
        Housing: {
            date: {
                parentConfig: false,
                hidden: false,
                shownInGrid: true
            }
        },
        tasks: {
            duedate: {
                fieldName: 'hello',
                parentConfig: {
                    storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                    dataIndex: 'date'
                }
                ,hidden: true
                ,shownInGrid: false
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
//            parentConfig: {
//                storeIdentifier:  {queryName: 'requests', schemaName: 'ehr'}
//                ,dataIndex: 'daterequested'
//            },
//            hidden: true,
            editorConfig: {
                minValue: (new Date()).add(Date.DAY, 2)
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
            editorConfig: {
                plugins: ['ehr-usereditablecombo']
            }
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
                if(!v && EHR.permissionMap && EHR.permissionMap.qcMap && EHR.permissionMap.qcMap.label['In Progress'])
                    qc = EHR.permissionMap.qcMap.label['Request: Pending'].RowId;
                return v || qc;
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
                xtype: 'datefield',
                format: 'Y-m-d'
                //nullable: false
            }
        },
        'Blood Draws': {
            requestor: {
                defaultValue: LABKEY.Security.currentUser.displayName
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
                xtype: 'numberfield',
                editorConfig: {
                    allowNegative: false,
                    listeners: {
                        change: function(field, val){
                            this.ownerCt.getForm().findField('quantity').calculateQuantity();
                        }
                    }
                }
                ,allowBlank: false
            },
            tube_vol: {
                allowBlank: false,
                editorConfig: {
                    allowNegative: false,
                    listeners: {
                        change: function(field, val){
                            this.ownerCt.getForm().findField('quantity').calculateQuantity();
                        }
                    }
                }
            },
            date: {
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
                allowBlank: false
            }
        },
        'Clinical Encounters': {
            title: {
                hidden: true
            },
            performedby: {
                allowBlank: true
            },
            enddate: {
                hidden: true
            },
            restraint: {
                hidden: true
            },
            restraintTime: {
                hidden: true
            }
        },
        'Clinpath Runs': {
            date: {
                editorConfig: {
                    minValue: null
                }
            },
            remark: {
                hidden: false
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
        project: {
//            parentConfig: {
//                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
//                recordIdentifier: function(parentRecord, childRecord){
//                    console.log(parentRecord);
//                    console.log(childRecord);
//                    if(!childRecord || !parentRecord){
//                        return;
//                    }
//                    if(childRecord.get('Id') && childRecord.get('Id') == parentRecord.get('Id')){
//                        return true;
//                    }
//                },
//                dataIndex: 'project'
//            }
            hidden: true
            ,shownInGrid: false
        }
        ,account: {
//            parentConfig: {
//                storeIdentifier: {queryName: 'Clinpath Runs', schemaName: 'study'},
//                recordIdentifier: function(parentRecord, childRecord){
//                    console.log(parentRecord);
//                    console.log(childRecord);
//                    if(!childRecord || !parentRecord){
//                        return;
//                    }
//                    if(childRecord.get('Id') && childRecord.get('Id') == parentRecord.get('Id')){
//                        return true;
//                    }
//                },
//                dataIndex: 'account'
//            }
            hidden: true
            ,shownInGrid: false
        }
        ,performedby: {
            hidden: true
        }
//        ,serviceRequested: {
//            xtype: 'displayfield'
//        }
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
            ,allowBlank: false
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
                hidden: false
                //label: 'Start Time'
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
            }
        },
        Deaths: {
            date: {
                parentConfig: null,
                hidden: false
            },
            caseno: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                    dataIndex: 'caseno'
                },
                xtype: 'displayfield'
            }
        },
        'Drug Administration': {
            begindate: {
                hidden: false
            }
            ,performedby: {
                allowBlank: true,
                hidden: true
            }
        },
        Alopecia: {
            head: {defaultValue: 'NA', hiddden: true},
            dorsum: {defaultValue: 'NA', hiddden: true},
            rump: {defaultValue: 'NA', hiddden: true},
            shoulders: {defaultValue: 'NA', hiddden: true},
            upperArms: {defaultValue: 'NA', hiddden: true},
            lowerArms: {defaultValue: 'NA', hiddden: true},
            hips: {defaultValue: 'NA', hiddden: true},
            upperLegs: {defaultValue: 'NA', hiddden: true},
            lowerLegs: {defaultValue: 'NA', hiddden: true},
            other: {defaultValue: 'NA', hiddden: true}

        }
    }
};

EHR.ext.Metadata.Biopsy = {
    allQueries: {
        Id: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'Id'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,date: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'date'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,begindate: {
            hidden: false
            ,allowBlank: false
        }
        ,parentId: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'objectid'
            }
            ,hidden: true
            ,shownInGrid: false
            ,allowBlank: false
        }
        ,project: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'project'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,account: {
            parentConfig: {
                storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                dataIndex: 'account'
            }
            ,hidden: true
            ,shownInGrid: false
        }
    },
    byQuery: {
        Biopsies: {
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
                allowBlank: true,
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
        performedby: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'performedby'
            }
            //,hidden: true
            ,shownInGrid: false
        }
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
                ,colModel: {
                    width: 60
                }

            },
            observation: {
                defaultValue: 'Normal'
                ,colModel: {
                    width: 40
                }
            },
            remark: {
                isAutoExpandColumn: true
            },
            code: {
                hidden: true
//                colModel: {
//                    width: 120
//                }
            }
        },
        'Clinical Encounters': {
            type: {
                defaultValue: 'Physical Exam'
            },
            serviceRequested: {
                hidden: true
            },
            enddate: {
                hidden: true
            },
            remark: {
                height: 100
            },
            performedby: {
                defaultValue: LABKEY.Security.currentUser.displayName,
                parentConfig: null
            }
        },
        'Clinical Remarks': {
            so: {
                shownInGrid: true
            },
            a: {
                shownInGrid: true
            },
            p: {
                shownInGrid: true
            }
        }
    }
};


EHR.ext.Metadata.Treatments = {
    allQueries: {

    },
    byQuery: {
        'Drug Administration': {
            'id/curlocation/location': {
                shownInGrid: true
            },
            code: {
                editorConfig: {
                    defaultSubset: 'Drugs and Procedures'
                }
            },
            volume: {
                colModel: {
                    width: 40
                }
            },
            vol_units: {
                colModel: {
                    width: 40
                }
            },
            performedby: {
                shownInGrid: true,
                defaultValue: null
            }

        }
    }
};

EHR.ext.Metadata['New Animal'] = {
    allQueries: {
        project: {
            allowBlank: true
        },
        account: {
            allowBlank: true
        }
    },
    byQuery: {

    }
};

EHR.ext.hiddenCols = 'lsid,objectid,parentid,taskid,requestid'; //,createdby,modifiedby
EHR.ext.topCols = 'id,date,enddate,project,account';
EHR.ext.bottomCols = 'remark,performedBy,qcstate,'+EHR.ext.hiddenCols;
EHR.ext.sharedCols = ',id,date,project,account,remark,performedby,'+EHR.ext.hiddenCols;

EHR.ext.FormColumns = {
    Alopecia: EHR.ext.topCols+',score,cause,head,shoulders,upperArms,lowerArms,hips,rump,dorsum,upperLegs,lowerLegs,other,' + EHR.ext.bottomCols,
    Arrival: EHR.ext.topCols+',source,geoOrigin,gender,birth,dam,sire,initialRoom,initialCage,initialCond,'+EHR.ext.bottomCols,
    Assignment: EHR.ext.topCols+''+EHR.ext.bottomCols,
    'Bacteriology Results': EHR.ext.topCols+',method,organism,source,qualresult,result,units,antibiotic,sensitivity,'+EHR.ext.bottomCols,
    'Behavior Remarks': EHR.ext.topCols+',so,a,p,'+EHR.ext.bottomCols,
    Biopsies: EHR.ext.topCols+',caseno,type,veterinarian,performedby,nhpbmd,grossdescription,'+EHR.ext.bottomCols,
    Birth: EHR.ext.topCols+',estimated,gender,weight,wdate,dam,sire,room,cage,cond,origin,conception,type,'+EHR.ext.bottomCols,
    'Blood Draws': EHR.ext.topCols+',tube_type,tube_vol,num_tubes,quantity,requestor,additionalServices,billedby,assayCode,' + EHR.ext.bottomCols, //p_s,a_v,
    'Body Condition': EHR.ext.topCols+',score,weightstatus,remark,tattoo_chest,tattoo_thigh,tattoo_remark,' + EHR.ext.bottomCols,
    cage_observations: 'date,room,cage,feces,userId,no_observations,' + EHR.ext.sharedCols,
    Charges: EHR.ext.topCols+',type,unitCost,quantity,'+EHR.ext.bottomCols,
    'Chemistry Results': EHR.ext.topCols+',testid,method,resultOORIndicator,result,units,qualResult,'+EHR.ext.bottomCols,
    'Clinical Encounters': EHR.ext.topCols + ',title,type,serviceRequested,restraint,restraintTime,'+EHR.ext.bottomCols,
    'Clinical Remarks': EHR.ext.topCols+',so,a,p,'+EHR.ext.bottomCols,
    'Clinical Observations': EHR.ext.topCols+',area,observation,code,' + EHR.ext.bottomCols,
    'Clinpath Runs': EHR.ext.topCols+',serviceRequested,type,sampletype,sampleId,collectionMethod,collectedBy,'+EHR.ext.bottomCols,
    Deaths: EHR.ext.topCols+',tattoo,dam,cause,manner,'+EHR.ext.bottomCols,
    Demographics: EHR.ext.topCols+',species,gender,birth,death,hold,dam,sire,origin,geographic_origin,cond,medical,prepaid,'+EHR.ext.bottomCols,
    'Dental Status': EHR.ext.topCols+',priority,extractions,gingivitis,tartar,' + EHR.ext.bottomCols,
    'Drug Administration': 'id/curlocation/location,'+'id,date,begindate,enddate,project,account'+',code,qualifier,route,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,headerdate,restraint,restraintTime,remark,performedby,category,' + EHR.ext.bottomCols,
    'Final Reports': EHR.ext.topCols+','+EHR.ext.bottomCols,
    'Hematology Results': EHR.ext.topCols+',testid,method,result,units,qualResult,'+EHR.ext.bottomCols,
    'Hematology Morphology': EHR.ext.topCols+',morphology,score,'+EHR.ext.bottomCols,
    Histology: EHR.ext.topCols+',slideNum,stain,tissue,qualifier,trimdate,'+EHR.ext.bottomCols,
    'Housing': 'id,project,date,enddate,room,cage,id/numroommates/cagemates,cond,reason,isTemp,'+EHR.ext.bottomCols,
    'Immunology Results': EHR.ext.topCols+',testid,method,result,units,qualResult,'+EHR.ext.bottomCols,
    'Irregular Observations': 'id/curlocation/location,'+EHR.ext.topCols + ',feces,menses,other,tlocation,behavior,otherbehavior,other,breeding,'+EHR.ext.bottomCols,
    'Necropsy Diagnosis': EHR.ext.topCols+',tissue,severity,duration,distribution,process,'+EHR.ext.bottomCols,
    Necropsies: EHR.ext.topCols+',tattoo,caseno,performedby,assistant,billing,nhpbmd,timeofdeath,causeofdeath,mannerofdeath,perfusion_area,perfusion_soln1,perfusion_time1,perfusion_soln2,perfusion_time2,grossdescription,'+EHR.ext.bottomCols,
    'Notes': EHR.ext.topCols+',userid,category,value,'+EHR.ext.bottomCols,
    'Morphologic Diagnosis': EHR.ext.topCols+',tissue,severity,duration,distribution,distribution2,inflammation,etiology,process,process2,'+EHR.ext.bottomCols,
    'Pair Tests': EHR.ext.topCols+',partner,bhav,testno,sharedFood,aggressions,affiliation,conclusion,'+EHR.ext.bottomCols,
    'Parasitology Results': EHR.ext.topCols+',organism,method,result,units,qualresult,'+EHR.ext.bottomCols,
    'Procedure Codes': EHR.ext.topCols+',code,'+EHR.ext.bottomCols,
    'Problem List': EHR.ext.topCols+',code,category,'+EHR.ext.bottomCols,
    'Organ Weights': EHR.ext.topCols+',tissue,qualifier,weight,'+EHR.ext.bottomCols,
    requests: 'rowid,title,formtype,daterequested,priority,notify1,notify2,createdby,qcstate',
    Restraint: EHR.ext.topCols+',enddate,type,totaltime,'+EHR.ext.bottomCols,
    tasks: 'rowid,title,formtype,created,createdby,assignedto,duedate,taskid,category,qcstate',
    'TB Tests': EHR.ext.topCols + ',lot,dilution,eye,result1,result2,result3,'+EHR.ext.bottomCols,
    'Teeth': EHR.ext.topCols+',jaw,side,tooth,status,' + EHR.ext.bottomCols,
    'Tissue Samples': EHR.ext.topCols+',tissue,qualifier,preservation,recipient,'+EHR.ext.bottomCols,
    'Treatment Orders': EHR.ext.topCols+',meaning,code,qualifier,route,frequency,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,' + EHR.ext.bottomCols,
    'Urinalysis Results': EHR.ext.topCols+',testid,method,resultOORIndicator,result,units,qualResult,'+EHR.ext.bottomCols,
    'Virology Results': EHR.ext.topCols+',virus,method,source,resultOORIndicator,result,units,qualResult,'+EHR.ext.bottomCols,
    Vitals: EHR.ext.topCols+',temp,heartrate,resprate,' + EHR.ext.bottomCols,
    Weight: 'id/curlocation/location,'+EHR.ext.topCols + ',weight,'+EHR.ext.bottomCols
};
