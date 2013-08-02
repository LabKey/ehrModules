/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @class
 * This is the panel that appears when hitting the 'Add Bulk' button on EHR grids.  It provides a popup to find the set of
 * distinct animal IDs based on room, case, etc.
 */
Ext4.define('EHR.window.AddAnimalsWindow', {
    extend: 'Ext.window.Window',
    initComponent: function(){
        Ext4.apply(this, {
            title: 'Choose Animals',
            modal: true,
            border: true,
            bodyStyle: 'padding:5px',
            width: 400,
            defaults: {
                width: 385,
                border: false,
                bodyBorder: false
            },
            items: [{
                html: 'This helper is designed to quick add records to the grid below.  You can look up animals in a variety of different ways.',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'radiogroup',
                itemId: 'radio',
                fieldLabel: 'Choose Type',
                columns: 1,
                defaults: {
                    xtype: 'radio',
                    name: 'type'
                },
                items: [{
                    inputValue: 'animal',
                    boxLabel: 'List of Animals',
                    checked: true
                },{
                    inputValue: 'location',
                    boxLabel: 'Location'
                },{
                    inputValue: 'animalGroup',
                    boxLabel: 'Animal Group'
                },{
                    inputValue: 'project',
                    boxLabel: 'Project/Protocol'
                }],
                listeners: {
                    scope: this,
                    change: this.onTypeChange
                }
            },{
                xtype: 'form',
                itemId: 'theForm',
                defaults: {
                    width: 370,
                    border: false
                }
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: function(btn){
                    this.getAnimals();
                }
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').hide();
                }
            }]
        });

        this.callParent(arguments);

        this.animalHandler();
    },

    onTypeChange: function(field, val, oldVal){
        if (!val || !val.type)
            return;

        var method = val.type + 'Handler';
        LDK.Assert.assertTrue('Unknown handler in AddAnimalsWindow: ' + method, Ext4.isFunction(this[method]));

        if (Ext4.isFunction(this[method])){
            this[method]();
        }

    },

    animalHandler: function(){
        var form = this.down('#theForm');
        form.removeAll();
        form.add({
            xtype: 'textarea',
            height: 100,
            itemId: 'subjArea',
            fieldLabel: 'Id(s)'
        });

        form.getAnimals = function(){
            //we clean up, combine subjects
            var subjectList = this.down('#subjArea').getValue();
            if(subjectList){
                subjectList = subjectList.replace(/[\s,;]+/g, ';');
                subjectList = subjectList.replace(/(^;|;$)/g, '');
                subjectList = subjectList.toLowerCase();
                subjectList = subjectList.split(';');
                this.addSubjects(subjectList)
            }
            else {
                Ext4.Msg.alert('Error', 'Must enter at least 1 animal Id');
            }
        }
    },

    addSubjects: function(subjectList){
        if (subjectList.length && this.targetStore){
            subjectList = Ext4.Array.unique(subjectList);
            if (subjectList.length > 200){
                Ext4.Msg.alert('Error', 'Too many animals were returned: ' + subjectList.length);
                return;

            }

            var records = [];
            Ext4.Array.forEach(subjectList, function(s){
                records.push(this.targetStore.createModel({Id: s}));
            }, this);
            this.targetStore.add(records);
        }

        if (Ext4.Msg.isVisible())
            Ext4.Msg.hide();

        this.close();
    },

    locationHandler: function(){
        var form = this.down('#theForm');
        form.removeAll();
        form.add([{
            xtype: 'ehr-areafield',
            multiSelect: false,
            emptyText: '',
            fieldLabel: 'Area',
            itemId: 'areaField',
            pairedWithRoomField: true,
            getRoomField: function(){
                return this.up('form').down('#roomField')
            }
        },{
            xtype: 'ehr-roomfield',
            emptyText: '',
            fieldLabel: 'Room(s)',
            itemId: 'roomField'
        },{
            xtype: 'ehr-cagefield',
            itemId: 'cageField',
            fieldLabel: 'Cage'
        }]);

        form.getAnimals = function(){
            var room = this.down('#roomField').getValue();
            room = !room || Ext4.isArray(room) ? room : [room];

            var cage = this.down('#cageField').getValue();

            var filterArray = [LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)];

            if (!Ext4.isEmpty(room))
                filterArray.push(LABKEY.Filter.create('room', room.join(';'), LABKEY.Filter.Types.EQUALS_ONE_OF));

            if (!Ext4.isEmpty(cage))
                filterArray.push(LABKEY.Filter.create('cage', cage, LABKEY.Filter.Types.EQUAL));


            if (filterArray.length == 1){
                Ext4.Msg.alert('Error', 'Must choose a location');
                return;
            }

            this.doQuery({
                schemaName: 'study',
                queryName: 'housing',
                filterArray: filterArray
            });
        }
    },

    animalGroupHandler: function(){
        var form = this.down('#theForm');
        form.removeAll();
        form.add([{
            xtype: 'ehr-animalgroupfield',
            emptyText: '',
            itemId: 'groupField'
        }]);

        form.getAnimals = function(){
            var group = this.down('#groupField').getValue();
            if (!group){
                Ext4.Msg.alert('Error', 'Must choose a group');
                return;
            }

            var filterArray = [
                LABKEY.Filter.create('groupId', group, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
            ];

            this.doQuery({
                schemaName: 'ehr',
                queryName: 'animal_group_members',
                filterArray: filterArray
            });
        }
    },

    projectHandler: function(){
        var form = this.down('#theForm');
        form.removeAll();
        form.add([{
            html: 'This will return any animals currently assigned to the selected project or a protocol',
            style: 'padding-bottom: 10px;'
        },{
            xtype: 'ehr-projectfield',
            emptyText: '',
            itemId: 'projectField',
            onlyIncludeProtocolsWithAssignments: true
        },{
            xtype: 'ehr-protocolfield',
            emptyText: '',
            itemId: 'protocolField',
            onlyIncludeProtocolsWithAssignments: true
        }]);

        form.getAnimals = function(){
            var projectId = this.down('#projectField').getValue();
            var protocol = this.down('#protocolField').getValue();
            if (!projectId && !protocol){
                Ext4.Msg.alert('Error', 'Must choose a project or protocol');
                return;
            }

            if (projectId && protocol){
                Ext4.Msg.alert('Error', 'Cannot pick both a project and protocol');
                return;
            }

            var filterArray = [LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)];

            if (projectId)
                filterArray.push(LABKEY.Filter.create('project', projectId, LABKEY.Filter.Types.EQUAL));

            if (protocol)
                filterArray.push(LABKEY.Filter.create('project/protocol', protocol, LABKEY.Filter.Types.EQUAL));

            this.doQuery({
                schemaName: 'study',
                queryName: 'assignment',
                filterArray: filterArray
            });
        }
    },

    getAnimals: function(){
        this.down('#theForm').getAnimals.call(this);
    },

    doQuery: function(config){
        this.hide();
        Ext4.Msg.wait("Loading...");

        //find distinct animals matching criteria
        LABKEY.Query.selectRows(Ext4.apply({
            sort: 'Id',
            columns: 'Id',
            scope: this,
            success: this.onSuccess,
            failure: LDK.Utils.getErrorCallback()
        }, config));
    },

    onSuccess: function(results){
        if (!results.rows || !results.rows.length){
            Ext4.Msg.hide();
            Ext4.Msg.alert('', 'No matching animals were found.');
            return;
        }

        var records = [];
        Ext4.Array.forEach(results.rows, function(row){
            if(row.Id)
                records.push(row.Id);
        }, this);

        this.addSubjects(records);
    }
});
