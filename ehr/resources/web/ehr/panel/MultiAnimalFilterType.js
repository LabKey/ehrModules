/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.panel.MultiAnimalFilterType', {
    extend: 'LDK.panel.MultiSubjectFilterType',
    alias: 'widget.ehr-multianimalfiltertype',

    statics: {
        filterName: 'multiSubject',
        label: 'Multiple Animals'
    },

    getItems: function(){
        var ctx = this.filterContext || {};

        var toAdd = this.callParent();

        toAdd[1].items[0].items.push({
            xtype: 'labkey-linkbutton',
                    text: '[Search By Room/Cage]',
                    minWidth: 80,
                    handler: function(btn){
                var panel = btn.up('ehr-multianimalfiltertype');

                Ext4.create('Ext.window.Window', {
                    width: 330,
                    closeAction: 'destroy',
                    title: 'Search By Room/Cage',
                    items: [{
                        xtype: 'form',
                        bodyStyle:'padding:5px',
                        items: [{
                            fieldLabel: 'Room',
                            emptyText: '',
                            itemId: 'room',
                            name: 'roomField',
                            xtype: 'combo',
                            displayField:'room',
                            valueField: 'room',
                            typeAhead: true,
                            queryMode: 'local',
                            width: 300,
                            store: Ext4.create('LABKEY.ext4.Store', {
                                schemaName: 'ehr_lookups',
                                queryName: 'room_list',
                                sort: 'room',
                                //filterArray: [LABKEY.Filter.create('TotalAnimals', 0, LABKEY.Filter.Types.NOT_EQUAL)],
                                autoLoad: true
                            })
                        },{
                            xtype: 'numberfield',
                            fieldLabel: 'Cage',
                            name: 'cageField',
                            itemId: 'cage',
                            width: 300
                        }]
                    }],
                    buttons: [{
                        text:'Submit',
                        disabled:false,
                        itemId: 'submit',
                        scope: panel,
                        handler: panel.loadRoom
                    },{
                        text: 'Close',
                        handler: function(btn){
                            btn.up('window').hide();
                        }
                    }]
                }).show(btn);
            }
        });

        toAdd[1].items[0].items.push({
            xtype: 'labkey-linkbutton',
                    text: '[Search By Project/Protocol]',
                    minWidth: 80,
                    handler: function(btn){
                var panel = btn.up('ehr-multianimalfiltertype');

                Ext4.create('Ext.window.Window', {
                    width: 330,
                    closeAction: 'destroy',
                    title: 'Search By Project/Protocol',
                    items: [{
                        xtype: 'form',
                        bodyStyle:'padding:5px',
                        items: [{
                            xtype: 'labkey-combo',
                            fieldLabel: 'Project',
                            emptyText:'',
                            itemId: 'project',
                            displayField: 'project',
                            valueField: 'project',
                            queryMode: 'local',
                            width: 300,
                            editable: true,
                            store: Ext4.create('LABKEY.ext4.Store', {
                                schemaName: 'ehr',
                                queryName: 'project',
                                viewName: 'Projects With Active Assignments',
                                sort: 'project',
                                autoLoad: true
                            })
                        },{
                            fieldLabel: 'Protocol',
                            emptyText:'',
                            itemId: 'protocol',
                            xtype: 'labkey-combo',
                            displayField: 'protocol',
                            valueField: 'protocol',
                            typeAhead: true,
                            width: 300,
                            editable: true,
                            queryMode: 'local',
                            store: Ext4.create('LABKEY.ext4.Store', {
                                schemaName: 'ehr',
                                queryName: 'protocol',
                                viewName: 'Protocols With Active Assignments',
                                sort: 'protocol',
                                autoLoad: true
                            })
                        }]
                    }],
                    buttons: [{
                        text:'Submit',
                        disabled:false,
                        itemId: 'submit',
                        scope: panel,
                        handler: panel.loadProject
                    },{
                        text: 'Close',
                        handler: function(btn){
                            btn.up('window').close();
                        }
                    }]
                }).show(btn);
            },
            style: 'margin-bottom:10px'
        });



        return toAdd;
    },

    loadProject: function(btn){
        var win = btn.up('window');
        var project = win.down('#project').getValue();
        var protocol = win.down('#protocol').getValue();
        win.down('#project').reset();
        win.down('#protocol').reset();

        win.close();

        Ext4.Msg.wait("Loading..");

        if(!project && !protocol){
            Ext4.Msg.hide();
            return;
        }

        var filters = [];

        if(project){
            filters.push(LABKEY.Filter.create('project', project, LABKEY.Filter.Types.EQUAL))
        }

        if(protocol){
            protocol = protocol.toLowerCase();
            filters.push(LABKEY.Filter.create('project/protocol', protocol, LABKEY.Filter.Types.EQUAL))
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'Assignment',
            viewName: 'Active Assignments',
            sort: 'Id',
            filterArray: filters,
            scope: this,
            success: function(rows){
                var subjectArray = [];
                Ext4.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this);
                subjectArray = Ext4.unique(subjectArray);
                if(subjectArray.length){
                    this.tabbedReportPanel.setSubjGrid(subjectArray);
                }
                Ext4.Msg.hide();
            },
            failure: LDK.Utils.getErrorCallback()
        });
    },

    loadRoom: function(btn){
        var housingWin = btn.up('window');
        var room = housingWin.down('#room').getValue();
        var cage = housingWin.down('#cage').getValue();
        housingWin.down('#room').reset();
        housingWin.down('#cage').reset();

        housingWin.close();

        Ext4.Msg.wait("Loading...");

        if(!room && !cage){
            Ext4.Msg.hide();
            return;
        }

        var filters = [];

        if(room){
            room = room.toLowerCase();
            filters.push(LABKEY.Filter.create('room', room, LABKEY.Filter.Types.STARTS_WITH))
        }

        if(cage){
            filters.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.EQUAL))
        }

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'housing',
            viewName: 'Active Housing',
            sort: 'Id',
            filterArray: filters,
            scope: this,
            success: function(rows){
                var subjectArray = [];
                Ext4.each(rows.rows, function(r){
                    subjectArray.push(r.Id);
                }, this);
                subjectArray = Ext4.unique(subjectArray);
                if(subjectArray.length){
                    this.tabbedReportPanel.setSubjGrid(subjectArray);
                }
                Ext4.Msg.hide();
            },
            failure: LDK.Utils.getErrorCallback()
        });
    }
});