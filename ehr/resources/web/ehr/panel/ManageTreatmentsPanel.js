/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * @cfg {String} animalId
 */
Ext4.define('EHR.panel.ManageTreatmentsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ehr-managetreatmentspanel',

    minWidth: 800,
    minHeight: 50,

    statics: {
        getButtonConfig: function(){
            return [{
                xtype: 'button',
                text: 'Order Medication',
                disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'insert', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                handler: function(btn){

                }
            },{
                xtype: 'button',
                text: 'Order Diet',
                disabled: !EHR.Security.hasPermission(EHR.QCStates.COMPLETED, 'insert', [{schemaName: 'study', queryName: 'Treatment Orders'}]),
                handler: function(btn){

                }
            }]
        }
    },

    initComponent: function(){
        Ext4.apply(this, {
            border: false,
            items: [this.getGridConfig()],
            buttons: this.hideButtons ? null : this.getButtonConfig()
        });

        this.callParent();

        this.on('render', function(){
            if (this.store.loading){
                this.store.on('load', function(){
                    this.setLoading(false);
                }, this);

                this.setLoading(true);
            }
        }, this);
    },

    getStore: function(){
        if (this.store)
            return this.store;

        this.store = Ext4.create('LABKEY.ext4.Store', {
            schemaName: 'study',
            queryName: 'Treatment Orders',
            columns: 'lsid,objectid,Id,date,enddate,category,remark,performedby,code,dose,dose_units,amount,amount_units,concentration,conc_units',
            filterArray: [
                LABKEY.Filter.create('Id', this.animalId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL)
            ],
            autoLoad: true
        });

        return this.store;
    },

    getGridConfig: function(){
        return {
            xtype: 'grid',
            border: true,
            store: this.getStore(),
            columns: [{
                xtype: 'actioncolumn',
                width: 40,
                icon: LABKEY.ActionURL.getContextPath() + '/_images/editprops.png',
                tooltip: 'Edit',
                handler: function(view, rowIndex, colIndex, item, e, rec){

                }
            },{
                header: 'Date',
                xtype: 'datecolumn',
                width: 160,
                format: 'Y-m-d h:m',
                dataIndex: 'date'
            },{
                header: 'End Date',
                xtype: 'datecolumn',
                width: 160,
                format: 'Y-m-d h:m',
                dataIndex: 'enddate'
            },{
                header: 'Code',
                width: 200,
                dataIndex: 'code',
                renderer: function(value, cellMetaData, record){
                    if(record && record.raw && record.raw['code']){
                        if(Ext4.isDefined(record.raw['code'].displayValue))
                            return record.raw['code'].displayValue;
                    }

                    return value;
                }
            },{
                header: 'Amount',
                dataIndex: 'amount'
            },{
                header: 'Units',
                dataIndex: 'amount_units'
            },{
                header: 'Ordered By',
                width: 160,
                dataIndex: 'performedby'
            },{
                header: 'Category',
                dataIndex: 'category'
            }]
        }
    }
});