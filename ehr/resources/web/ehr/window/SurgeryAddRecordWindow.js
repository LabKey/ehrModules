/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg targetGrid
 * @cfg encountersStore
 */
Ext4.define('EHR.window.SurgeryAddRecordWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        var data = this.getData();

        LABKEY.ExtAdapter.apply(this, {
            modal: true,
            closeAction: 'destroy',
            title: 'Add Record',
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'Please choose which procedure is associated with this record:',
                style: 'padding-bottom: 10px;'
            },{
                xtype: 'combo',
                itemId: 'comboField',
                width: 400,
                displayField: 'title',
                valueField: 'parentid',
                store: {
                    type: 'store',
                    fields: ['title', 'parentid', 'Id', 'date'],
                    data: this.getData()
                },
                forceSelection: true
            }],
            buttons: [{
                text: 'Submit',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent(arguments);

        if (!data.length) {
            this.on('beforeshow', function(){
                Ext4.Msg.alert('No Records', 'Cannot add results to this section without a corresponding panel above.  Note: the panels must have an Id/date in order to enter results');
                this.close();
                return false;
            }, this);
        }
        else if (data.length == 1){
            var parentid = data[0].parentid;
            this.on('beforeshow', function(){
                this.processParentId(parentid);
                return false;
            }, this);
        }
    },

    onSubmit: function(){
        var parentid = this.down('#comboField').getValue();
        if (!parentid){
            Ext4.Msg.alert('Error', 'Must select a procedure');
            return;
        }

        this.processParentId(parentid);
    },

    processParentId: function(parentid){
        var combo = this.down('#comboField');
        var recIdx = combo.store.find('parentid', parentid);

        LDK.Assert.assertTrue('Unable to find record', recIdx != -1);
        var rec = combo.store.getAt(recIdx);

        var cellEditing = this.targetGrid.getPlugin('cellediting');
        if (cellEditing)
            cellEditing.completeEdit();

        var model = this.targetGrid.store.createModel({});
        var obj = {};
        Ext4.Array.forEach(['Id', 'date', 'parentid'], function(field){
            if (this.targetGrid.store.getFields().get(field)){
                obj[field] = rec.get(field);
            }
        }, this);

        model.set(obj);

        this.targetGrid.store.insert(0, [model]); //add a blank record in the first position

        if (cellEditing)
            cellEditing.startEditByPosition({row: 0, column: this.targetGrid.firstEditableColumn || 0});

        this.close();
    },

    getData: function(){
        var data = [];
        this.encountersStore.each(function(r){
            if (r.get('Id') && r.get('date')){
                var title = r.get('Id') + ': ' + r.get('procedureid');
                data.push({
                    title: title,
                    parentid: r.get('parentid'),
                    Id: r.get('Id'),
                    date: r.get('date')
                });
            }
        }, this);

        return data;
    }
});