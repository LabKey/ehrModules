/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('EHR.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ehr-formpanel',

    statics: {
        defaultFieldWidth: 400,
        defaultLabelWidth: 150
    },

    initComponent: function(){
        Ext4.QuickTips.init();

        LABKEY.ExtAdapter.apply(this, {
            items: this.items || this.getItemsConfig(),
            bodyStyle: 'padding: 5px;',
            //TODO: is this necessary??
            pollForChanges: true,
            defaults: {
                border: false
            },
            buttonAlign: 'left'
        });

        this.bindConfig = this.bindConfig || {};
        LABKEY.Utils.mergeIf(this.bindConfig, {
            autoCreateRecordOnChange: true,
            autoBindFirstRecord: true
        });

        this.plugins = this.plugins || [];
        this.plugins.push(Ext4.create('EHR.plugin.Databind'));

        this.callParent();

        this.addEvents('recordchange', 'fieldvaluechange');
    },

    getItemsConfig: function(){
        var items = [];

        var fields = EHR.model.DefaultClientModel.getFieldConfigs(this.formConfig.fieldConfigs, this.formConfig.configSources);
        var compositeFields = {};

        Ext4.Array.forEach(fields, function(field){
            if (field.jsonType == 'date' && field.extFormat){
                if (Ext4.Date.formatContainsHourInfo(field.extFormat)){
                    field.xtype = 'xdatetime';
                }
            }

            var cfg = EHR.DataEntryUtils.getFormEditorConfig(field);
            LABKEY.ExtAdapter.apply(cfg, {
                labelWidth: EHR.form.Panel.defaultLabelWidth,
                width: EHR.form.Panel.defaultFieldWidth
            });

            //skip hidden fields
            if (cfg.hidden)
                return;

            if (cfg.height && this.maxFieldHeight && cfg.height > this.maxFieldHeight){
                cfg.height = this.maxFieldHeight;
            }

            if (field.compositeField){
                cfg.fieldLabel = undefined;

                if(!compositeFields[field.compositeField]){
                    compositeFields[field.compositeField] = {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        border: false,
                        fieldLabel: field.compositeField,
                        width: EHR.form.Panel.defaultFieldWidth,
                        labelWidth: EHR.form.Panel.defaultLabelWidth,
                        items: [cfg]
                    };
                    items.push(compositeFields[field.compositeField]);

                    if(compositeFields[field.compositeField].msgTarget == 'below'){
                        //create a div to hold error messages
                        compositeFields[field.compositeField].msgTargetId = Ext4.id();
                        items.push({
                            tag: 'div',
                            fieldLabel: null,
                            border: false,
                            id: compositeFields[field.compositeField].msgTargetId
                        });
                    }
                    else {
                        cfg.msgTarget = 'qtip';
                    }
                }
                else {
                    compositeFields[field.compositeField].items.push({
                        xtype: 'splitter',
                        border: false
                    });
                    compositeFields[field.compositeField].items.push(cfg);
                }
            }
            else {
                items.push(cfg);
            }
        }, this);

        //distribute width for compositeFields
        for (var i in compositeFields){
            var compositeField = compositeFields[i];
            var toResize = [];
            //this leaves a 2px buffer between each field
            var availableWidth = EHR.form.Panel.defaultFieldWidth - EHR.form.Panel.defaultLabelWidth;
            for (var j=0;j<compositeFields[i].items.length;j++){
                var field = compositeFields[i].items[j];
                //if the field isnt using the default width, we assume it was deliberately customized
                if (field.xtype == 'splitter'){
                    availableWidth = availableWidth - 10;
                }
                else if (field.width && field.width != EHR.form.Panel.defaultFieldWidth){
                    availableWidth = availableWidth - field.width;
                }
                else {
                    toResize.push(field)
                }
            }

            if(toResize.length){
                var newWidth = availableWidth/toResize.length;
                for (var j=0;j<toResize.length;j++){
                    toResize[j].width = newWidth;
                }
            }
        }

        var visibleHeight = 0;
        Ext4.Array.forEach(items, function(item){
            if (!item.hidden)
                visibleHeight++;
        }, this);

        //divide the fields into columns, if selected
        var cols = [];
        var numColumns = this.maxItemsPerCol ? Math.ceil(items.length / this.maxItemsPerCol): 1;
        for (var i=0;i<numColumns;i++){
            var start = (i * this.maxItemsPerCol);
            var stop = this.maxItemsPerCol ? start + this.maxItemsPerCol : items.length;
            cols.push({
                border: false,
                columnWidth: (1/ numColumns),
                defaults: {
                    border: false
                },
                items: items.slice(start, stop)
            });
        }

        items = [{
            xtype: 'panel',
            layout: 'column',
            defaults: {
                border: false
            },
            items: cols
        }];

        return items;
    }
});


