/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



EHR.ext.AnimalSelector = Ext.extend(Ext.Panel, {
    initComponent: function()
    {

        Ext.applyIf(this, {
            layout: 'form'
            ,title: 'Choose Animals'
            ,bodyBorder: true
            ,border: true
            //,frame: true
            ,bodyStyle: 'padding:5px'
            ,width: 350
            ,defaults: {
                width: 200,
                border: false,
                bodyBorder: false,
                parentPanel: this.parentPanel || this
            }
            ,items: [
                {
                    xtype: 'textfield',
                    ref: 'subjArea',
                    fieldLabel: 'Id(s)'
                },
                {
                    xtype: 'combo'
                    ,emptyText:''
                    ,fieldLabel: 'Area'
                    ,displayField:'area'
                    ,valueField: 'area'
                    ,typeAhead: true
                    ,editable: true
                    ,triggerAction: 'all'
                    ,store: new LABKEY.ext.Store({
                        containerPath: 'WNPRC/EHR/',
                        schemaName: 'lookups',
                        queryName: 'areas',
                        sort: 'area',
                        autoLoad: true
                    }),
                    ref: 'areaField'

                },
                {
                    emptyText:''
                    ,fieldLabel: 'Room'
                    ,ref: 'roomField'
                    ,xtype: 'combo'
                    ,displayField:'room'
                    ,valueField: 'room'
                    ,typeAhead: true
                    ,triggerAction: 'all'
                    ,editable: true
                    ,store: new LABKEY.ext.Store({
                    containerPath: 'WNPRC/EHR/',
                    schemaName: 'lookups',
                    queryName: 'rooms',
                    sort: 'room',
                    autoLoad: true
                })
                },
                {
                    xtype: 'textfield',
                    ref: 'cageField',
                    fieldLabel: 'Cage'
                }
            ],
            buttons: [
                {
                    xtype: 'button',
                    text: 'Add Animals',
                    handler: this.getAnimals,
                    scope: this
                }
            ]
            //buttonAlign: 'left'
        });

        EHR.ext.AnimalSelector.superclass.initComponent.call(this, arguments);
    },

    getFilterArray: function(button)
    {
        var room = (this.roomField ? this.roomField.getValue() : null);
        var cage = (this.cageField ? this.cageField.getValue() : null);
        var area = (this.areaField ? this.areaField.getValue() : null);

        //we clean up, combine subjects
        var subjectList = this.subjArea.getValue();
        subjectList = subjectList.replace(/[\s,;]+/g, ';');
        subjectList = subjectList.replace(/(^;|;$)/g, '');
        subjectList = subjectList.toLowerCase();

        var filterArray = [];

        if (area)
            filterArray.push(LABKEY.Filter.create('curLocation/area', area, LABKEY.Filter.Types.STARTS_WITH));

        if (room)
            filterArray.push(LABKEY.Filter.create('curLocation/room', room, LABKEY.Filter.Types.STARTS_WITH));

        if (cage)
            filterArray.push(LABKEY.Filter.create('curLocation/cage', cage, LABKEY.Filter.Types.EQUAL));

        if (subjectList)
            filterArray.push(LABKEY.Filter.create('Id', subjectList, LABKEY.Filter.Types.EQUALS_ONE_OF));

        return filterArray;
    },

    getAnimals: function(button)
    {
        Ext.Msg.wait("Loading...");

        var filterArray = this.getFilterArray();

        if (!filterArray.length)
        {
            Ext.Msg.hide();
            alert('Must Enter A Filter');
            return;
        }

        //find distinct animals matching criteria
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'Animal',
            viewName: 'Alive, at WNPRC',
            //containerPath: 'WNPRC/EHR/',
            filterArray: filterArray,
            scope: this,
            successCallback: this.onSuccess
        });

    },
    onSuccess: function(results){
        if (!results.rows || !results.rows.length)
        {
            alert('No matching animals were found.');
            Ext.Msg.hide();
            return;
        }

        var ids = {};
        Ext.each(results.rows, function(row)
        {
            if (!ids[row.Id])
                ids[row.Id] = 0;

            ids[row.Id] += 1;
        }, this);

        if (this.targetStore)
        {
            var records = [];
            for(var i in ids)
                records.push({Id: i});
            this.targetStore.addRecords(records, 0);
        }

        Ext.Msg.hide();
    }

});
Ext.reg('ehr-animalselector', EHR.ext.AnimalSelector);


EHR.ext.TaskHeader = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        this.store = new EHR.ext.AdvancedStore({
            //xtype: 'ehr-store',
            //containerPath: 'WNPRC/EHR/',
            schemaName: 'ehr',
            queryName: 'tasks',
            columns: EHR.ext.FormColumns.tasks,
            filterArray: [LABKEY.Filter.create('taskid', this.uuid, LABKEY.Filter.Types.EQUAL)],
            metadata: this.metadata || EHR.ext.standardTaskMetadata,
            //maxRows: 1,
            storeId: 'ehr||tasks||',
            autoLoad: true,
            parentPanel: this,
            noValidationCheck: true
        });

        Ext.apply(this, {
            autoHeight: true
            ,autoWidth: true
            ,id: 'tasks'
            ,name: 'tasks'
            ,bodyBorder: false
            ,border: true
            ,bodyStyle: 'padding:5px 5px 5px 5px'
            ,style: 'margin-bottom: 15px'
            ,buttons: []
            ,plugins: ['databind']
//            ,disableUnlessBound: true
            ,bindOnChange: false
            ,autoBindRecord: true
            ,showDeleteBtn: false
            ,readOnly: true
            ,fieldTriggers: {}
            ,tbar: new Ext.Toolbar({buttonAlign: 'left', hidden: true})
            ,defaults: {
                width: 180,
                border: false,
                bodyBorder: false,
                parentPanel: this.parentPanel || this
            }
            ,items: [{
                xtype: (debug ? 'displayfield' : 'hidden'),
                fieldLabel: 'Task Id',
                name: 'taskid',
                dataIndex: 'taskid',
                value: this.uuid
//            },{
//                xtype: 'displayfield',
//                fieldLabel: 'Created By',
//                name: 'createdby',
//                dataIndex: 'createdby'
//            },{
//                xtype: 'displayfield',
//                fieldLabel: 'Created',
//                name: 'created',
//                dataIndex: 'created'
            },{
                xtype: 'displayfield',
                fieldLabel: 'Task Type',
                name: 'type',
                dataIndex: 'type',
                value: this.formType
            },{
                xtype: 'datefield',
                fieldLabel: 'Due Date',
                name: 'duedate',
                dataIndex: 'duedate'
            },{
                xtype: 'textfield',
                fieldLabel: 'Assigned To',
                name: 'assignedto',
                dataIndex: 'assignedto'
            }]
        });

        EHR.ext.TaskHeader.superclass.initComponent.call(this, arguments);
    }
});
Ext.reg('ehr-taskheader', EHR.ext.TaskHeader);


EHR.ext.ClinicalHeader = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        Ext.applyIf(this, {
            autoHeight: true
            ,autoWidth: true
            ,id: 'encounters'
            ,name: 'encounters'
            ,title: 'Header'
            ,bodyBorder: false
            ,border: true
            ,buttons: []
            ,bodyStyle: 'padding:5px 5px 5px 5px'
            ,style: 'margin-bottom: 15px'
            ,plugins: ['databind']
            //databind plugin options
            ,disableUnlessBound: true
            ,bindOnChange: false
            ,showDeleteBtn: false
            ,autoBindRecord: true

            ,monitorValid: false
            ,fieldTriggers: {}
            ,tbar: new Ext.Toolbar({buttonAlign: 'left', hidden: true})
            ,defaults: {
                border: false,
                bodyBorder: false,
                parentPanel: this.parentPanel || this
            }
            ,items: [
                {
                    layout: 'column'
                    ,labelAlign: 'top'
                    ,defaults: {
                    border: false,
                    bodyBorder: false
                }
                    ,items: [
                    {
                        columnWidth:'250px',
                        style:'padding-right:4px;padding-top:0px',
                        layout: 'form',
                        defaults: {
                            parentPanel: this.parentPanel || this,
                            border: false,
                            bodyBorder: false
                        },
                        items: [
                            {
                                xtype:'ehr-participant',
                                name: 'Id',
                                dataIndex: 'Id',
                                allowBlank: false,
                                ref: '../../Id',
                                msgTarget: 'under'
                            },
                            {
                                xtype: (debug ? 'combo' : 'hidden')
                                ,fieldLabel: 'QC State'
                                ,ref: '../../qcstate'
                                ,width: 140
                                ,name: 'qcstate'
                                ,dataIndex: 'QCState'
                                ,displayField:'Label'
                                ,valueField: 'RowId'
                                ,forceSelection: true
                                ,typeAhead: false
                                ,triggerAction: 'all'
                                ,mode: 'local'
                                ,store: EHR.ext.getLookupStore({
                                containerPath: 'WNPRC/EHR/',
                                schemaName: 'study',
                                queryName: 'QCState',
                                sort: 'Label',
                                listeners: {
                                    scope: this,
                                    change: function(f){
                                        console.log('QC change')
                                    },
                                    select: function(f){
                                        console.log('QC change')
                                    }
                                }
                            })
                            }
//                            {
//                                xtype: (debug ? 'displayfield' : 'hidden')
//                                ,fieldLabel: 'Type'
//                                ,ref: '../../category'
//                                ,width: 140
//                                ,name: 'type'
//                                ,dataIndex: 'type'
//                                ,displayField:'category'
//                                ,valueField: 'category'
//                                ,value: this.formType || 'Clinical'
//                                ,forceSelection: true
//                                ,typeAhead: false
//                                ,triggerAction: 'all'
//                                ,mode: 'local'
//                                ,store: EHR.ext.getLookupStore({
//                                    containerPath: 'WNPRC/EHR/',
//                                    schemaName: 'lookups',
//                                    queryName: 'encounter_types',
//                                    sort: 'category'
//                                  })
//                            }
                        ]
                    },
                    {
                        columnWidth:'300px',
                        layout: 'form',
                        border: false,
                        bodyBorder: false,
                        defaults: {
                            parentPanel: this.parentPanel || this
                        },
                        items: [
                            {
                                xtype:'xdatetime',
                                name: 'date',
                                dataIndex: 'date',
                                allowBlank: false,
                                ref: '../../date',
                                fieldLabel: 'Date/Time',
                                dateFormat: 'Y-m-d',
                                timeFormat: 'H:i'
                            }
                        ]
                    },
                    {
                        //columnWidth:'220px',
                        style:'padding-left:5px;padding-top:0px',
                        layout: 'form',
                        defaults: {
                            parentPanel: this.parentPanel || this,
                            border: false,
                            bodyBorder: false
                        },
                        items: [
                            {
                                xtype:'ehr-project',
                                name: 'project',
                                dataIndex: 'Project',
                                msgTarget: 'under',
                                allowBlank: false,
                                ref: '../../project'
                            }
//                            ,{
//                                xtype: (debug ? 'displayfield' : 'hidden'),
//                                name: 'objectid',
//                                dataIndex: 'objectid',
//                                width: 140,
//                                fieldLabel: 'UUID',
//                                ref: '../../key',
//                                value: this.uuid
//                            }
                        ]
                    }
                ]
                }
            ]
            ,store: {
                xtype: 'ehr-store',
                containerPath: 'WNPRC/EHR/',
                schemaName: 'study',
                queryName: 'encounters',
                columns: EHR.ext.FormColumns.encounters,
                filterArray: [LABKEY.Filter.create('objectid', this.parentPanel.uuid, LABKEY.Filter.Types.EQUAL)],
                metadata: this.metadata || EHR.ext.standardEncounterMetadata,
                //maxRows: 1,
                storeId: 'study||encounters||',
                autoLoad: true,
                noValidationCheck: true
            }
        });

        EHR.ext.ClinicalHeader.superclass.initComponent.call(this, arguments);

        this.addEvents('participantvalid', 'participantinvalid');

        if (this.parentPanel)
        {
            this.parentPanel.relayEvents(this, ['participantvalid', 'participantinvalid']);
            this.parentPanel.qcstate = this.qcstate;
        }
    }
});
Ext.reg('ehr-clinheader', EHR.ext.ClinicalHeader);

EHR.ext.AbstractPanel = Ext.extend(Ext.FormPanel, {
    initComponent: function()
    {
        Ext.apply(this, {
            layout: 'form'
            ,id: 'abstract'
            ,title: 'Animal Info'
            ,border: true
            ,bodyBorder: false
            ,autoHeight: true
            ,fieldTriggers: {}
            ,defaults: {
                border: false,
                bodyBorder: false,
                labelStyle: 'padding: 0px;'
            }
            ,defaultType: 'displayfield'
            ,style: 'margin-bottom: 15px'
            ,bodyStyle: 'padding:5px'
            ,ref: '../../abstract'
            ,items: {html: 'No Animal Selected'}
        });
        EHR.ext.AbstractPanel.superclass.initComponent.call(this, arguments);

        if (this.parentPanel){
            this.relayEvents(this.parentPanel, ['participantvalid', 'participantinvalid']);
        }

        this.on('participantvalid', this.fetchAbstract, this);
        this.on('participantinvalid', this.clearAbstract, this);

    },
    fetchAbstract: function(c)
    {
        this.idField = c;
        var id = c.getValue();
        if (!id){
            this.parentPanel.submitHolds.add({invalidAnimal: true});
        }

        //no need to reload if ID is unchanged
        if (c.loadedId == id){
            return;
        }

        if(!id){
            this.removeAll();
            this.add({html: 'No Animal Selected'});
            this.doLayout();
            return;
        }

        c.loadedId = id;
        this.removeAll();

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'animal',
            viewName: 'Clinical Summary',
            containerPath: 'WNPRC/EHR/',
            filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            successCallback: this.renderAbstract
        });
    },
    renderAbstract: function(data)
    {
        this.removeAll();

        if (!data.rows.length)
        {
            this.idField.markInvalid('Animal Id Not Found');
            this.parentPanel.submitHolds.add({invalidAnimal: true});
        }
        else
        {
            this.parentPanel.submitHolds.remove({invalidAnimal: true});
            var row = data.rows[0];
            Ext.each(data.metaData.fields, function(c)
            {
                if (this.fieldTriggers[c.name])
                    this.fieldTriggers[c.name](c, row, data);

                if (c.hidden)
                    return false;
                var value = row['_labkeyurl_' + c.name] ? '<a href="' + row['_labkeyurl_' + c.name] + '" target=new>' + row[c.name] + '</a>' : row[c.name];
                var field = this.add({id: c.name, xtype: 'displayfield', fieldLabel: c.caption, value: value, submitValue: false});

                if (c.name == 'Id')
                    c.loadedId = row[c.name];
            }, this);
        }

        this.doLayout();
        this.expand();
    },
    clearAbstract: function(c)
    {
        c.loadedId = undefined;

        if (c.getValue())
        {
            this.removeAll();
            this.add({html: 'Invalid ID'});
            this.doLayout();
            this.expand();
        }
    }

})
Ext.reg('ehr-abstractpanel', EHR.ext.AbstractPanel);


