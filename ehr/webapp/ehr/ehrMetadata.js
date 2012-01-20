/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.ns('EHR.Metadata.Sources');

/**
 * @class
 * @name EHR.Metadata
 * @description The EHR UI is heavily driven by metadata.  EHR.Metadata provides a number of static config objects that
 * are merged to provide the final config object used to generate the Ext-based forms.  These are organized into 'Metadata sources'.
 * Each source is a node under EHR.Metadata.Sources.  They can be requested used .getTableMetadata() and will be merged in order to form
 * the final Ext config object.  The purpose of this system is to allow sharing/inheritance of complex configuration between many forms.
 */


/**
 * @memberOf EHR.Metadata
 * @param {String} queryName The name of the query for which to retrieve metadata
 * @param {Array} sources An array of metadata sources (in order) from which to retrieve metadata.  If the metadata source has metadata on this query, these will be merged with the default metadata in the order provided.
 * @description If the following is called:
 * <p>
 * EHR.Metadata.getTableMetadata('Necropsies', ['Task', 'Necropsy'])
 * <p>
 * Then the following config objects will be merged, in order, if they are present, to form the final config object:
 * <p>
 * EHR.Metadata.Sources.Standard.allQueries
 * EHR.Metadata.Sources.Standard['Necropsies']
 * EHR.Metadata.Sources.Task.allQueries
 * EHR.Metadata.Sources.Task['Necropsies']
 * EHR.Metadata.Sources.Necropsy.allQueries
 * EHR.Metadata.Sources.Necropsies['Necropsies']
 * <p>
 * The purpose is to allow layering on config objects and inheritance such tht different forms can support highly customized behaviors per field.
 * <p>
 * Also, arbitrary new additional metadata sources can be added in the future, should they become required.
 */
EHR.Metadata.getTableMetadata = function(queryName, sources)
{
    var meta = {};

    EHR.Utils.rApplyClone(meta, EHR.Metadata.Sources.Standard.allQueries);
//
    if (EHR.Metadata.Sources.Standard.byQuery[queryName])
    {
        EHR.Utils.rApplyClone(meta, EHR.Metadata.Sources.Standard.byQuery[queryName]);
    }

    if (sources && sources.length)
    {
        Ext.each(sources, function(source)
        {
            if (EHR.Metadata.Sources[source])
            {
                if (EHR.Metadata.Sources[source].allQueries)
                {
                    EHR.Utils.rApplyClone(meta, EHR.Metadata.Sources[source].allQueries);
                }

                if (EHR.Metadata.Sources[source].byQuery && EHR.Metadata.Sources[source].byQuery[queryName])
                {
                    EHR.Utils.rApplyClone(meta, EHR.Metadata.Sources[source].byQuery[queryName]);
                }

            }
        }, this);
    }

    return meta;
};

/**
 * Describes the metadata of a single field.  It includes any fields in LABKEY.Query.FieldMetaData, along with those described here.
 * @name EHR.Metadata.FieldMetadata
 * @class Describes the metadata of a single field.  It includes any fields in LABKEY.Query.FieldMetaData, along with those described here.
 *
 */

/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name allowDuplicateValue
 * @description If false, the EHR.ext.RecordDuplicatorPanel will not give the option to duplicate the value in this field
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name noDuplicateByDefault
 * @description If true, this field will not be checked by default in an EHR.ext.RecordDuplicatorPanel, which provides a mechanism to duplicate records in a data entry panel.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name noSaveInTemplateByDefault
 * @description If true, this field will not be checked by default in an EHR.ext.SaveTemplatePanel, which provides a mechanism to save templates from a data entry panel.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name allowSaveInTemplate
 * @description If false, an EHR.ext.SaveTemplatePanel will not give the option to include this field in saved templates
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name updateValueFromServer
 * @description If true, when a record is validated on the server, if this validated record contains a value for this field then it will be applied to the record on the client.  Currently used to automatically populate location, cagemates or active assignments.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name ignoreColWidths
 * @description If true, the LabKey-provided column widths will be deleted.  The effect is to auto-size columns equally based on available width.
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name defaultValue
 * @description A value to use as the default for any newly created records
 * @type Mixed
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name colModel
 * @description A config object that will be used when a column config is created from this metadata object using EHR.ext.metaHelper.getColumnConfig().  This can contain any properties that will be interpreted by Ext or your custom code.
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name setInitialValue
 * @description A function that will be called to set the initial value of this field.  Similar to defaultValue, except more complex values can be generated.  This function will be passed 2 arguments: value (the current value.  if defaultValue is defined, value will be the defaultValue) and rec (the Ext.data.Record)
 * @type Function
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name  parentConfig
 * @description A object used by EHR.ext.StoreInheritance to configure parent/child relationships between fields.  It is an object containing the following:
 * <br>
 * <li>storeIdentifier: An object with the properties: queryName and schemaName</li>
 * <li>dataIndex: The dataIndex of the field in the parent record that will be used as the value on this field</li>
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name shownInGrid
 * @description If false, this field will not be shown in the default grid view
 * @type String
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name shownInForm
 * @description If false, this field will not be shown in the default form panel
 * @type String
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name editorConfig
 * @description A config object that will be used when an editor config is created from this metadata object using EHR.ext.metaHelper.getDefaultEditor() or any derivatives such as getFormEditor() or getGridEditor().  This can contain any properties that will be interpreted by Ext or your custom code.
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name formEditorConfig
 * @description Similar to editorConfig, except will only be applied when the editor is created through getFormEditor() or getFormEditorConfig().
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name gridEditorConfig
 * @description Similar to editorConfig, except will only be applied when the editor is created through getGridEditor() or getGridEditorConfig();
 * @type Object
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name isAutoExpandColumn
 * @description If true, then this column will auto-expand to will available width in an EditorGrid
 * @type Boolean
 */
/**#@+
 * @memberOf EHR.Metadata.FieldMetadata
 * @field
 * @name qtipRenderer
 * @description A function to override the default qtipRender created in EHR.metaHelper.buildQtip().  See this method for more detail.
 * @type Function
 */



/**
 * A set of static config objects of metadata used in data entry forms, among other places.
 * @name EHR.Metadata.Sources
 * @description
 * Each property of EHR.Metadata.Sources is a 'metadata source', which can be requested by name in EHR.Metadata.getTableMetadata().
 * Each metadata source should have 2 properties: allQueries and byQuery.
 * <p>
 * allQueries is an object with metadata to be applied to every
 * query requesting this metadata source.  Properties of allQueries should match field names.
 * <br>
 * byQuery is a map of additional metadata applied only to specific queries.  The keys of this object should match query names.  Each of these should be
 * an object describing metadata per field, using field name as the key.  It is identical in structure to the allQueries object.
 * <p>
 * NOTE: these metadata config objects will be layered, so it is important to consider where it is most appropriate to defined a given attribute.
 *
 */


/**
 * The default metadata applied to all queries when using getTableMetadata().
 * @memberOf EHR.Metadata.Sources
 * @description
 * This is the default metadata applied to all queries when using getTableMetadata().  If adding attributes designed to be applied
 * to a given query in all contexts, they should be added here
 */
EHR.Metadata.Sources.Standard = {
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
                width: 65
                ,showLink: false
            }
            //noDuplicateByDefault: true
        },
        'id/curlocation/location': {
            hidden: true,
            updateValueFromServer: true,
            allowBlank: true,
            nullable: true,
            shownInGrid: true,
            caption: 'Location',
            header: 'Location',
            lookups: false,
            allowDuplicateValue: false,
            colModel: {
                width: 75,
                showLink: false
            }
        }
        ,'id/numroommates/cagemates': {
            hidden: true,
            updateValueFromServer: true,
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
        ,daterequested: {
            xtype: 'xdatetime',
            noDuplicateByDefault: true,
            format: 'Y-m-d H:i'
        }
        ,date: {
            allowBlank: false,
            nullable: false,
            //noDuplicateByDefault: true,
            format: 'Y-m-d H:i',
            editorConfig: {
                dateFormat: 'Y-m-d',
                otherToNow: true,
                timeFormat: 'H:i',
                plugins: ['ehr-participantfield-events']
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
        ,testid: {
            colModel: {
                showLink: false
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
        ,restraint: {
            shownInGrid: false,
            editorConfig: {
                listeners: {
                    change: function(field, val){
                        var theForm = this.ownerCt.getForm();
                        if(theForm){
                            var restraintDuration = theForm.findField('restraintDuration');

                            if(val)
                                restraintDuration.setValue('<30 min');
                            else
                                restraintDuration.setValue(null);

                            restraintDuration.fireEvent('change', restraintDuration.getValue())
                        }
                    }
                }
            }
        }
        ,restraintDuration: {
            shownInGrid: false
            ,lookup: {
                sort: 'sort_order'
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
                            var newVal = EHR.Utils.padDigits(val, 4);
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
            },
            colModel: {
                width: 150,
                showLink: false
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
            allowDuplicateValue: false,
            noSaveInTemplateByDefault: true,
            setInitialValue: function(v){
                var qc;
                if(!v && EHR.Security.getQCStateByLabel('In Progress'))
                    qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
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
            printWidth: 150,
            editorConfig: {
                resizeDirections: 's'
            }
        }
        ,so: {
            xtype: 'ehr-remark',
            isAutoExpandColumn: true,
            printWidth: 150,
            editorConfig: {
                resizeDirections: 's'
            }
        }
        ,a: {
            xtype: 'ehr-remark',
            isAutoExpandColumn: true,
            printWidth: 150,
            editorConfig: {
                resizeDirections: 's'
            }
        }
        ,p: {
            xtype: 'ehr-remark',
            isAutoExpandColumn: true,
            printWidth: 150,
            editorConfig: {
                resizeDirections: 's'
            }
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
                allowDuplicateValue: false,
                setInitialValue: function(v){
                    var qc;
                    if(EHR.Security.getQCStateByLabel('In Progress'))
                        qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
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
                    return val || this.importPanel.title || this.importPanel.formType;
                }
            }
        },
        'Final Reports': {
            remark: {
                height: 400,
                width: 600
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
            notify3: {
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
                    if(!v && EHR.Security.getQCStateByLabel('In Progress'))
                        qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
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
            },
            method: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: false
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
//                                number = EHR.Utils.padDigits(number, (6-prefix.length));
//                                var id = prefix + number;
//                                this.setValue(id.toLowerCase());
//                            },
//                            failure: EHR.Utils.onError
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
        'Prenatal Deaths': {
            conception: {
                format: 'Y-m-d'
            }
            ,weight: {
                useNull: true
                ,editorConfig: {
                    allowNegative: false
                    ,decimalPrecision: 4
                }
            }
            ,Id: {
                xtype: 'trigger',
                editorConfig: {
                    triggerClass: 'x-form-search-trigger'
                    ,onTriggerClick: function (){
                        var prefix = 'pd';
                        var year = new Date().getFullYear().toString().slice(2);
                        var sql = "SELECT cast(SUBSTRING(MAX(id), 5, 6) AS INTEGER) as num FROM study.prenatal WHERE Id LIKE '" + prefix + year + "%'";
                        LABKEY.Query.executeSql({
                            schemaName: 'study',
                            sql: sql,
                            scope: this,
                            success: function(data){
                                var caseno;
                                if(data.rows && data.rows.length==1){
                                    caseno = data.rows[0].num;
                                    caseno++;
                                }
                                else {
                                    //console.log('no existing IDs found');
                                    caseno = 1;
                                }

                                caseno = EHR.Utils.padDigits(caseno, 2);
                                var val = prefix + year + caseno;
                                this.setValue(val);
                                this.fireEvent('change', val)
                            },
                            failure: EHR.Utils.onError
                        });
                    }
                    ,allowAnyId: true
                }
            }
            ,sire: {lookups: false}
            ,dam: {
                lookups: false
                ,allowBlank: false
            }
            ,project: {hidden: true}
            ,performedby: {hidden: true}
            ,account: {hidden: true}
            ,room: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
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
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Tissue Samples': {
            diagnosis: {
                xtype: 'ehr-snomedcombo'
            },
            performedby: {
                hidden: true
            },
            preservation: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
            qualifier: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
            container_type: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
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
            },
            stain: {
                defaultValue: 'Hematoxylin & Eosin',
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
            pathologist: {
                shownInGrid: false
            },
            pathology: {
                shownInGrid: false
            },
            trimdate: {
                shownInGrid: false
            },
            trim_remark: {
                shownInGrid: false
            },
            trimmed_by: {
                shownInGrid: false
            },
            qualifier: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
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
            ,room: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
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
            date: {
                xtype: 'datefield',
                format: 'Y-m-d'
            },
            collectionMethod : {shownInGrid: false},
            //collectedBy : {shownInGrid: false},
            sampleType : {
                //shownInGrid: false
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            },
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
                showInGrid: false,
                updateValueFromServer: true,
                xtype: 'displayfield'
            },
            objectid: {
                setInitialValue: function(v, rec)
                {
                    return v || LABKEY.Utils.generateUUID();
                }
            }
        },
        'Dental Status': {
            gingivitis: {allowBlank: false, includeNullRecord: false},
            tartar: {allowBlank: false, includeNullRecord: false},
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
                    //fixed: true,
                    width: 100
                },
                shownInGrid: true
            }
            ,enddate: {
                xtype: 'datefield',
                format: 'Y-m-d',
                colModel: {
                    //fixed: true,
                    width: 100
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
                            var amountField = theForm.findField('amount');
                            amountField.setValue(amount);
                            amountField.fireEvent('change', amount, amountField.startValue);
                        }
                    }
                    ,decimalPrecision: 3
                },
                header: 'Vol',
                colModel: {
                    width: 50
                }
            }
            ,vol_units: {
                compositeField: 'Volume',
//                editorConfig: {
//                    fieldLabel: null
//                }
                header: 'Vol Units',
                colModel: {
                    width: 50
                }
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
                allowBlank: false,
                xtype: 'combo',
                lookup: {
                    filterArray: [LABKEY.Filter.create('protocol/protocol', null, LABKEY.Filter.Types.NONBLANK)],
                    columns: 'project,protocol,account'
                },
                editorConfig: {
                    plugins: ['ehr-participantfield-events']
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
//            perfusion_soln1: {
////                xtype: 'lovcombo',
//                editorConfig: {
//                    plugins: ['ehr-usereditablecombo']
//                },
//                lookup: {
//                    schemaName: 'ehr_lookups',
//                    queryName: 'necropsy_perfusion',
//                    keyColumn: 'perfusion',
//                    displayColumn: 'perfusion'
//                }
//            },
//            perfusion_soln2: {
////                xtype: 'lovcombo',
//                editorConfig: {
//                    plugins: ['ehr-usereditablecombo']
//                },
//                lookup: {
//                    schemaName: 'ehr_lookups',
//                    queryName: 'necropsy_perfusion',
//                    keyColumn: 'perfusion',
//                    displayColumn: 'perfusion'
//                }
//            },
//            perfusion_time1: {
//                xtype: 'xdatetime',
//                format: 'Y-m-d H:i',
//                editorConfig: {
//                    dateFormat: 'Y-m-d',
//                    timeFormat: 'H:i'
//                }
//            },
//            perfusion_time2: {
//                xtype: 'xdatetime',
//                format: 'Y-m-d H:i',
//                editorConfig: {
//                    dateFormat: 'Y-m-d',
//                    timeFormat: 'H:i'
//                }
//            },
            timeofdeath: {
                xtype: 'xdatetime',
                format: 'Y-m-d H:i',
                allowBlank: false,
                editorConfig: {
                    dateFormat: 'Y-m-d',
                    timeFormat: 'H:i'
                }
            },
            tissue_distribution: {
                xtype: 'lovcombo',
                hasOwnTpl: true,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'tissue_distribution',
                    displayColumn: 'location',
                    keyColumn: 'location'
                }
            },
            grossdescription: {
                height: 200,
                width: 600,
                defaultValue: 'A ___ kg rhesus macaque is presented for necropsy in excellent post mortem condition.\n\nA ___ kg cynomolgus macaque is presented for necropsy in excellent post mortem condition.\n\nA ___ kg common marmoset is presented for necropsy in excellent post mortem condition.\n\nA ____ kg cynomolgus macaque is presented for perfusion and necropsy in excellent post mortem condition.\n\nA ____ kg rhesus macaque is presented for perfusion and necropsy in excellent post mortem condition.'
            },
            patho_notes: {
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

                                    caseno = EHR.Utils.padDigits(caseno, 3);
                                    var val = year + prefix + caseno;
                                    panel.theField.setValue(val);
                                    panel.theField.fireEvent('change', val)
                                },
                                failure: EHR.Utils.onError
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
                hasOwnTpl: true,
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
            },
            causeofdeath: {
                allowBlank: false
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

                                    caseno = EHR.Utils.padDigits(caseno, 3);
                                    var val = year + prefix + caseno;
                                    panel.theField.setValue(val);
                                    panel.theField.fireEvent('change', val)
                                },
                                failure: EHR.Utils.onError
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
            inflammation2: {
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
                shownInGrid: true
            },
            tissue_qualifier: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
        },
        'Organ Weights': {
            performedby: {
                hidden: true
            },
            qualifier: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
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
            score: {lookupNullCaption: '', useNull: true, editorConfig: {useNull: true}},
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
                lookup: {
                    columns: '*',
                    filterArray: [LABKEY.Filter.create('categories', 'chemistry', LABKEY.Filter.Types.CONTAINS)]
                },
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
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Immunology Results': {
            testid: {
                lookup: {
                    columns: '*',
                    filterArray: [LABKEY.Filter.create('categories', 'immunology', LABKEY.Filter.Types.CONTAINS)]
                },
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
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Hematology Results': {
            testid: {
                lookup: {
                    columns: '*',
                    filterArray: [LABKEY.Filter.create('categories', 'hematology', LABKEY.Filter.Types.CONTAINS)]
                },
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
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
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
                lookup: {
                    columns: '*',
                    filterArray: [LABKEY.Filter.create('categories', 'urinalysis', LABKEY.Filter.Types.CONTAINS)]
                },
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
            ,method: {
                shownInGrid: false
            }
            ,remark: {
                shownInGrid: false
            }
        },
        'Virology Results': {
            date: {
                xtype: 'datefield'
                ,format: 'Y-m-d'
            },
            method: {
                shownInGrid: false
            },
            remark: {
                shownInGrid: false
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
                    minValue: new Date(),
                    dateConfig: {
                        minValue: new Date()
                    }
                }
            }
            ,CageAtTime: {
                hidden: true,
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            if(val && !isNaN(val)){
                                var newVal = EHR.Utils.padDigits(val, 4);
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
                hasOwnTpl: true,
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
            source: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                },
                allowBlank: false
            },
            performedby: {hidden: true},
            remark: {shownInGrid: false},
            dam: {shownInGrid: false},
            sire: {shownInGrid: false},
            initialRoom: {
                hidden: false,
                allowBlank: false
            },
            initialCage: {
                hidden: false,
                allowBlank: false,
                editorConfig: {
                    listeners: {
                        change: function(field, val){
                            if(val && !isNaN(val)){
                                var newVal = EHR.Utils.padDigits(val, 4);
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
            destination: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                },
                allowBlank: false
            }
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
            project: {
                hidden: false,
                allowBlank: false
            },
            account: {hidden: true},
            necropsy: {lookups: false},
            cause: {allowBlank: false},
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
            ,requestor: {shownInGrid: false, hidden: true, formEditorConfig:{readOnly: true}}
            ,performedby: {shownInGrid: false}
            ,instructions: {shownInGrid: false}
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
                        var sql = "SELECT max(cast(regexp_replace(SUBSTRING(assayCode, "+(prefix.length+1)+"), '[a-z,\-]+', '') as integer)) as maxNumber FROM study.blood WHERE assayCode LIKE '" + prefix + "%'  AND lcase(SUBSTRING(assayCode, "+(prefix.length+1)+")) = ucase(SUBSTRING(assayCode, "+(prefix.length+1)+"))";
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

                                //number = EHR.Utils.padDigits(number, (6-prefix.length));
                                var id = prefix + number;
                                this.setValue(id.toLowerCase());
                                this.fireEvent('change', this.getValue());
                            },
                            failure: EHR.Utils.onError
                        });
                    }
                }
            }
            ,additionalServices: {
                xtype: 'lovcombo',
                hasOwnTpl: true,
                includeNullRecord: false,
                lookup: {
                    schemaName: 'ehr_lookups',
                    queryName: 'blood_draw_services',
                    displayColumn: 'service',
                    keyColumn: 'service'
                },
                editorConfig: {
                	tpl: null,
                	separator: ';'
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
                },
                colModel: {
                    width: 60,
                    showLink: false
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
                        var quantityField = theForm.findField('quantity');
                        quantityField.setValue(quantity);
                        quantityField.fireEvent('change', quantity, quantityField.startValue);
                    }
                }
                ,allowBlank: true
                ,colModel: {
                    width: 55,
                    header: '# Tubes',
                    showLink: false
                }

            }
            ,tube_vol: {
                shownInGrid: true
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
                ,colModel: {
                    width: 75,
                    header: 'Tube Vol (mL)',
                    showLink: false
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
                compositeField: 'Dosage',
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
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
                    plugins: ['ehr-usereditablecombo'],
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
            ,route: {
                shownInGrid: false,
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
            }
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
                            var amountField = theForm.findField('amount');
                            amountField.setValue(amount);
                            amountField.fireEvent('change', amount, amountField.startValue);
                        }
                    }
                    ,decimalPrecision: 3
                }
            }
            ,vol_units: {
                compositeField: 'Volume'
                ,header: 'Units'
                ,editorConfig: {
                    plugins: ['ehr-usereditablecombo']
                }
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
                ,editorConfig: {
                    plugins: ['ehr-usereditablecombo']
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
            ,restraintDuration: {
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

/**
 * @name EHR.Metadata.Sources.Task
 * This is the default metadata applied to all Tasks when using getTableMetadata().
 * Among other things, it sets of the parent/child relationship for cild records to inherit taskId from the ehr.tasks record.
 */
EHR.Metadata.Sources.Task = {
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
};

/**
 * @name EHR.Metadata.Sources.SimpleForm
 * This is the default metadata applied any record when displayed in the context of a single record (ie. not part of a task or request)
 */
EHR.Metadata.Sources.SimpleForm = {
    allQueries: {
        QCState: {
            hidden: false
            ,editable: true
            ,setInitialValue: function(v){
                var qc;
                if(!v && EHR.Security.getQCStateByLabel('In Progress'))
                    qc = EHR.Security.getQCStateByLabel('In Progress').RowId;
                return v || qc;
            }
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

/**
 * @name EHR.Metadata.Sources.Encounter
 * This is the default metadata applied any record when displayed in the context of an encounter.  An encounter is the special situation in which
 * a task only refers to one ID.  In these cases, there is a single study.Clinical Encounters record, and Id/Date/Project are inherited from this record to children.
 */
EHR.Metadata.Sources.Encounter = {
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
        ,restraint: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'restraint'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,restraintDuration: {
            parentConfig: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                dataIndex: 'restraintDuration'
            }
            ,hidden: true
            ,shownInGrid: false
        }
        ,begindate: {
            setInitialValue: function(v, rec){
                var field = rec.fields.get('begindate');
                var store = Ext.StoreMgr.get('study||Clinical Encounters||||');
                if(store)
                    var record = store.getAt(0);
                if(record)
                    var date = record.get('date');
                if(date)
                    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                return v || date;
            }
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
            restraint: {
                parentConfig: null,
                hidden: false
            },
            restraintDuration: {
                parentConfig: null,
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
            },
            performedby: {
                allowBlank: false
            }
        },
        tasks: {
            duedate: {
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

/**
 * @name EHR.Metadata.Sources.Request
 * This is the default metadata applied any record when displayed in the context of a request.  Metadata placed here
 * can be used to hide fields not editable at time of request.  It also configured a parent/child relationship between the ehr.reqeusts record and dataset records.
 */
EHR.Metadata.Sources.Request = {
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
                minValue: (new Date()).add(Date.DAY, 2),
                dateConfig: {
                    minValue: (new Date()).add(Date.DAY, 2)
                }
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
                            if(this.ownerCt.getForm)
                                this.ownerCt.getForm().findField('quantity').calculateQuantity();
                        }
                    }
                }
                ,nullable: false
            },
            tube_vol: {
                nullable: false,
                editorConfig: {
                    allowNegative: false,
                    listeners: {
                        change: function(field, val){
                            if(this.ownerCt.getForm)
                                this.ownerCt.getForm().findField('quantity').calculateQuantity();
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
        'Clinpath Runs': {
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
        'Drug Administration': {
            performedby: {
                allowBlank: true
            }
        }
    }
};

/**
 * @name EHR.Metadata.Sources.Assay
 * This is the default metadata applied to records in the context of an assay, which currently is used by the ClinPath task.
 */
EHR.Metadata.Sources.Assay = {
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

/**
 * @name EHR.Metadata.Sources.Necropsy
 * This is the default metadata applied to records in the context of a necropsy task.  Among other things, it configured a parent/child relationship
 * between the study.necropsies record and other dataset records.  It is similar to Encounter, except the parent record is from study.Necropsies.
 */
EHR.Metadata.Sources.Necropsy = {
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
            setInitialValue: null
            ,hidden: false
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
                hidden: false,
                allowAnyId: true,
                xtype: 'trigger',
                editorConfig: {
                    plugins: ['ehr-participantfield'],
                    triggerClass: 'x-form-search-trigger',
                    onTriggerClick: function (){
                        Ext.Msg.confirm('Find Next PD Number In Series', 'Clicking OK will find the next available PD number for infant deaths.', function(v){
                            if(v == 'yes'){
                                var prefix = 'pd';
                                var year = new Date().getFullYear().toString().slice(2);
                                var sql = "SELECT cast(SUBSTRING(MAX(id), 5, 6) AS INTEGER) as num FROM study.prenatal WHERE Id LIKE '" + prefix + year + "%'";
                                LABKEY.Query.executeSql({
                                    schemaName: 'study',
                                    sql: sql,
                                    scope: this,
                                    success: function(data){
                                        var caseno;
                                        if(data.rows && data.rows.length==1){
                                            caseno = data.rows[0].num;
                                            caseno++;
                                        }
                                        else {
                                            //console.log('no existing IDs found');
                                            caseno = 1;
                                        }

                                        caseno = EHR.Utils.padDigits(caseno, 2);
                                        var val = prefix + year + caseno;
                                        this.setValue(val);
                                        this.fireEvent('change', val)
                                    },
                                    failure: EHR.Utils.onError
                                });
                            }
                        }, this);
                    }
                }
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
            },
            mannerofdeath: {
                editorConfig: {
                    plugins: ['ehr-usereditablecombo']
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

        },
        tasks: {
            duedate: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                    dataIndex: 'date'
                }
                ,hidden: true
                ,shownInGrid: false
            }
        },
        Weight: {
            date: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Necropsies', schemaName: 'study'},
                    dataIndex: 'timeofdeath'
                }
                ,hidden: false
                ,shownInGrid: false
            }
        }
    }
};

/**
 * @name EHR.Metadata.Sources.Biopsy
 * This is the default metadata applied to records in the context of a biopsy task.  Among other things, it configured a parent/child relationship
 * between the study.biopsies record and other dataset records.  It is similar to Encounter, except the parent record is from study.biopsies.
 */
EHR.Metadata.Sources.Biopsy = {
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
            setInitialValue: function(v, rec){
                var field = rec.fields.get('begindate');
                var store = Ext.StoreMgr.get('study||Biopsies||||');
                if(store)
                    var record = store.getAt(0);
                if(record)
                    var date = record.get('date');
                if(date)
                    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                return v || date;
            }
            ,hidden: false
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
        },
        tasks: {
            duedate: {
                parentConfig: {
                    storeIdentifier: {queryName: 'Biopsies', schemaName: 'study'},
                    dataIndex: 'date'
                }
                ,hidden: true
                ,shownInGrid: false
            }
        }
    }
};

/**
 * @name EHR.Metadata.Sources.Anesthesia
 * This is the default metadata applied to records in the context of anesthesia.  It was originally created for the purpose of adding recovery observations
 * to an MPR form; however, the hope is to perform these using paper.
 */
EHR.Metadata.Sources.Anesthesia = {
    allQueries: {

    },
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

/**
 * @name EHR.Metadata.Sources.PE
 * This is the default metadata applied to records in the context of physical exam.
 */
EHR.Metadata.Sources.PE = {
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
            major: {
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
        },
        'Body Condition': {
            microchip: {
                hidden: true
            },
            tag: {
                hidden: true
            }
        }
    }
};

/**
 * @name EHR.Metadata.Sources.NWM_PE
 * This is the default metadata applied to records in the context of physical exam of new world monkeys (NWM).
 */
EHR.Metadata.Sources.NWM_PE = {
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
            major: {
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
        },
        'Body Condition': {
            tattoo_chest: {
                hidden: true
            },
            tattoo_thigh: {
                hidden: true
            }
        }
    }
};

EHR.Metadata.Sources.Treatments = {
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
                },
                colModel: {
                    width: 120
                }
            },
            volume: {
                colModel: {
                    width: 50
                }
            },
            vol_units: {
                colModel: {
                    width: 50
                }
            },
            performedby: {
                shownInGrid: false,
                defaultValue: null
            },
            remark: {
                shownInGrid: true
            },
            date: {
                editorConfig: {
                    dateConfig: {
                        editable: false,
                        hideTrigger: true,
                        onTriggerClick: Ext.emptyFn
                    }
                }
            }
        }
    }
};

EHR.Metadata.Sources.NewAnimal = {
    allQueries: {
        project: {
            allowBlank: true
        },
        account: {
            allowBlank: true
        }
    },
    byQuery: {
        'TB Tests': {
            notPerformedAtCenter: {
                defaultValue: true
            },
            result1: {
                defaultValue: '-'
            },
            result2: {
                defaultValue: '-'
            },
            result3: {
                defaultValue: '-'
            }
        }
    }
};

/**
 * @name EHR.Metadata.Sources.MPR
 * This is the default metadata applied to records in the context of an MPR task.
 */
EHR.Metadata.Sources.MPR = {
    allQueries: {

    },
    byQuery: {
        'Clinical Encounters': {
            type: {
                defaultValue: 'Procedure'
            }
        },
        'Drug Administration': {
            amount: {
                shownInGrid: true,
                header: 'Amount',
                colModel: {
                    width: 50
                }
            },
            amount_units: {
                shownInGrid: true,
                header: 'Amt Units',
                colModel: {
                    width: 60
                }
            },
            vol_units: {
                header: 'Vol Units',
                colModel: {
                    width: 50
                }
            },
            volume: {
                colModel: {
                    width: 50
                }
            },
            category: {
                hidden: false
            }
        }
    }
};

/**
 * @name EHR.Metadata.Sources.Surgery
 * This is the default metadata applied to records in the context of a Surgery task.
 */
EHR.Metadata.Sources.Surgery = {
    allQueries: {

    },
    byQuery: {
        'Clinical Encounters': {
            type: {
                defaultValue: 'Surgery'
            },
            major: {
                allowBlank: false
            }
        },
        'Drug Administration': {
            category: {
                hidden: false
            }
        }
    }
};

EHR.Metadata.hiddenCols = 'lsid,objectid,parentid,taskid,requestid'; //,createdby,modifiedby
EHR.Metadata.topCols = 'id,date,enddate,project,account';
EHR.Metadata.bottomCols = 'remark,performedBy,qcstate,'+EHR.Metadata.hiddenCols;
EHR.Metadata.sharedCols = ',id,date,project,account,'+EHR.Metadata.bottomCols;

/**
 * A static object that specifies the default columns to be used in data entry forms.
 * When adding a new dataset or adding columns to an existing dataset, this should be modified.
 * Columns are hard-coded here because a number of otherwise hidden columns are required by data entry.
 * A newer option that may be available would be to create a hidden view of a consistent name (ie. 'Data Entry') for
 * each dataset and use this view to manage the column list.
 * @name EHR.Metadata.Columns
 * @class
 *
 *
 */
EHR.Metadata.Columns = {
    Alopecia: EHR.Metadata.topCols+',score,cause,head,shoulders,upperArms,lowerArms,hips,rump,dorsum,upperLegs,lowerLegs,other,' + EHR.Metadata.bottomCols,
    Arrival: EHR.Metadata.topCols+',source,geoOrigin,gender,birth,dam,sire,initialRoom,initialCage,initialCond,id/numroommates/cagemates,'+EHR.Metadata.bottomCols,
    Assignment: EHR.Metadata.topCols+',projectedRelease,'+EHR.Metadata.bottomCols,
    'Bacteriology Results': EHR.Metadata.topCols+',method,organism,source,qualresult,result,units,antibiotic,sensitivity,'+EHR.Metadata.bottomCols,
    'Behavior Remarks': EHR.Metadata.topCols+',so,a,p,'+EHR.Metadata.bottomCols,
    Biopsies: EHR.Metadata.topCols+',caseno,type,veterinarian,performedby,nhpbmd,grossdescription,'+EHR.Metadata.bottomCols,
    Birth: EHR.Metadata.topCols+',estimated,gender,weight,wdate,dam,sire,room,cage,cond,origin,conception,type,'+EHR.Metadata.bottomCols,
    'Blood Draws': 'id/curlocation/location,'+EHR.Metadata.topCols+',tube_type,tube_vol,num_tubes,quantity,requestor,additionalServices,billedby,assayCode,restraint,restraintDuration,daterequested,instructions,' + EHR.Metadata.bottomCols, //p_s,a_v,
    'Body Condition': EHR.Metadata.topCols+',score,weightstatus,remark,tattoo_chest,tattoo_thigh,microchip,tag,tattoo_remark,' + EHR.Metadata.bottomCols,
    cage_observations: 'date,room,cage,feces,userId,no_observations,' + EHR.Metadata.sharedCols,
    Charges: EHR.Metadata.topCols+',type,unitCost,quantity,'+EHR.Metadata.bottomCols,
    'Chemistry Results': EHR.Metadata.topCols+',testid,method,resultOORIndicator,result,units,qualResult,'+EHR.Metadata.bottomCols,
    'Clinical Encounters': EHR.Metadata.topCols + ',title,type,major,serviceRequested,restraint,restraintDuration,'+EHR.Metadata.bottomCols,
    'Clinical Remarks': EHR.Metadata.topCols+',so,a,p,'+EHR.Metadata.bottomCols,
    'Clinical Observations': EHR.Metadata.topCols+',area,observation,code,' + EHR.Metadata.bottomCols,
    'Clinpath Runs': EHR.Metadata.topCols+',serviceRequested,type,sampletype,sampleId,collectionMethod,collectedBy,'+EHR.Metadata.bottomCols,
    Deaths: EHR.Metadata.topCols+',tattoo,dam,cause,manner,'+EHR.Metadata.bottomCols,
    Demographics: EHR.Metadata.topCols+',species,gender,birth,death,hold,dam,sire,origin,geographic_origin,cond,medical,prepaid,v_status,'+EHR.Metadata.bottomCols,
    Departure: EHR.Metadata.topCols+',authorize,destination,'+EHR.Metadata.bottomCols,
    'Dental Status': EHR.Metadata.topCols+',priority,extractions,gingivitis,tartar,' + EHR.Metadata.bottomCols,
    'Drug Administration': 'id/curlocation/location,'+'id,date,begindate,enddate,project,account'+',code,qualifier,category,route,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,headerdate,restraint,restraintDuration,remark,performedby,' + EHR.Metadata.bottomCols,
    Feeding: EHR.Metadata.topCols+',amount,type,'+EHR.Metadata.bottomCols,
    'Final Reports': EHR.Metadata.topCols+','+EHR.Metadata.bottomCols,
    'Hematology Results': EHR.Metadata.topCols+',testid,method,result,units,qualResult,'+EHR.Metadata.bottomCols,
    'Hematology Morphology': EHR.Metadata.topCols+',morphology,score,'+EHR.Metadata.bottomCols,
    Histology: EHR.Metadata.topCols+',slideNum,stain,tissue,qualifier,container_type,pathologist,trimdate,trimmed_by,trim_remarks,'+EHR.Metadata.bottomCols,
    'Housing': 'id,project,date,enddate,room,cage,id/numroommates/cagemates,cond,reason,isTemp,'+EHR.Metadata.bottomCols,
    'Immunology Results': EHR.Metadata.topCols+',testid,method,result,units,qualResult,'+EHR.Metadata.bottomCols,
    'Irregular Observations': 'id/curlocation/location,'+EHR.Metadata.topCols + ',feces,menses,other,tlocation,behavior,otherbehavior,other,breeding,'+EHR.Metadata.bottomColsmCols,
    'Necropsy Diagnosis': EHR.Metadata.topCols+',tissue,severity,duration,distribution,process,'+EHR.Metadata.bottomCols,
    Necropsies: EHR.Metadata.topCols+',tattoo,caseno,performedby,assistant,billing,tissue_distribution,timeofdeath,causeofdeath,mannerofdeath,perfusion_area,grossdescription,patho_notes,'+EHR.Metadata.bottomCols,
    'Notes': EHR.Metadata.topCols+',userid,category,value,'+EHR.Metadata.bottomCols,
    'Morphologic Diagnosis': EHR.Metadata.topCols+',remark,tissue,tissue_qualifier,inflammation,inflammation2,etiology,process,process2,performedBy,qcstate,'+EHR.Metadata.hiddenCols,
    //,severity,duration,distribution,distribution2
    'Pair Tests': EHR.Metadata.topCols+',partner,bhav,testno,sharedFood,aggressions,affiliation,conclusion,'+EHR.Metadata.bottomCols,
    'Parasitology Results': EHR.Metadata.topCols+',organism,method,result,units,qualresult,'+EHR.Metadata.bottomCols,
    'Prenatal Deaths': EHR.Metadata.topCols+',species,gender,weight,dam,sire,room,cage,conception,'+EHR.Metadata.bottomCols,
    'Procedure Codes': EHR.Metadata.topCols+',code,'+EHR.Metadata.bottomCols,
    'Problem List': EHR.Metadata.topCols+',code,category,'+EHR.Metadata.bottomCols,
    'Organ Weights': EHR.Metadata.topCols+',tissue,qualifier,weight,'+EHR.Metadata.bottomCols,
    requests: 'rowid,title,formtype,daterequested,priority,notify1,notify2,notify3,createdby,qcstate',
    Restraint: EHR.Metadata.topCols+',enddate,type,totaltime,'+EHR.Metadata.bottomCols,
    tasks: 'rowid,title,formtype,created,createdby,assignedto,duedate,taskid,category,qcstate',
    'TB Tests': EHR.Metadata.topCols + ',notPerformedAtCenter,lot,dilution,eye,result1,result2,result3,'+EHR.Metadata.bottomCols,
    'Teeth': EHR.Metadata.topCols+',jaw,side,tooth,status,' + EHR.Metadata.bottomCols,
    'Tissue Samples': EHR.Metadata.topCols+',tissue,qualifier,preservation,quantity,recipient,ship_to,container_type,accountToCharge,'+EHR.Metadata.bottomCols,
    'Treatment Orders': EHR.Metadata.topCols+',meaning,code,qualifier,route,frequency,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,' + EHR.Metadata.bottomCols,
    'Urinalysis Results': EHR.Metadata.topCols+',testid,method,resultOORIndicator,result,units,qualResult,'+EHR.Metadata.bottomCols,
    'Virology Results': EHR.Metadata.topCols+',virus,method,source,resultOORIndicator,result,units,qualResult,'+EHR.Metadata.bottomCols,
    Vitals: EHR.Metadata.topCols+',temp,heartrate,resprate,' + EHR.Metadata.bottomCols,
    Weight: 'id/curlocation/location,'+EHR.Metadata.topCols + ',weight,'+EHR.Metadata.bottomCols
};
