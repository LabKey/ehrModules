/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * A trigger field which only allows numeric characters
 */
Ext4.define('EHR.form.field.DrugDoseField', {
    extend: 'EHR.form.field.TriggerNumberField',
    alias: 'widget.ehr-drugdosefield',

    triggerCls: 'x4-form-search-trigger',

    triggerToolTip: 'Click to calculate amount and volume based on concentration, dose and weight',

    initComponent: function(){
        this.callParent(arguments);

        this.on('change', function(field){
            field.showWeight(null);
        }, this);
    },

    onTriggerClick: function(){
        var record = EHR.DataEntryUtils.getBoundRecord(this);
        if (!record){
            console.log('unable to resolve record');
            return;
        }

        var conc = record.get('concentration');
        var dosage = record.get('dosage');
        var id = record.get('Id');

        if(!conc || !dosage || !id){
            Ext4.Msg.alert('Error', 'Must supply Id, dosage and concentration');
            return
        }

        var sc = record.store.storeCollection;
        if (sc){
            this.calculateDose(id, record, sc);
        }
    },

    calculateDose: function(id, record, sc){
        Ext4.Msg.wait('Loading weight...');

        EHR.DemographicsCache.getDemographics([id], function(animalIds, data){
            this.onDemographicsLoad(id, data ? data[id] : null, record, sc)
        }, this, -1);
    },

    onDemographicsLoad: function(id, data, record, sc){
        Ext4.Msg.hide();

        var weight = this.getClientWeight(sc, id) || data.getMostRecentWeight();

        if (!weight){
            Ext4.Msg.alert('Error', 'Unable to find weight, cannot calculate amount');
            return;
        }

        this.showWeight(weight);
        this.getDose(record, weight);
    },

    getClientWeight: function(sc, id){
        var store = sc.getServerStoreForQuery('study', 'weight');
        if (store){
            var weights = [];
            store.each(function(r){
                if (r.get('Id') == id && !Ext4.isEmpty(r.get('weight'))){
                    weights.push(r.get('weight'));
                }
            }, this);

            if (weights.length == 1)
                return weights[0];
        }
    },

    showWeight: function(weight){
        var fc = this.up('fieldcontainer');
        if (!fc){
            console.log('unable to find field container');
            return;
        }

        var target = fc.down('#' + fc.msgTargetId);
        if (!target){
            console.error('unable to find msg target');
            return;
        }

        if(weight){
            target.setValue('<span>Weight: '+weight+' kg</span>');
            target.setVisible(true);
        }
        else {
            target.setValue(null);
            target.setVisible(false);
        }
    },

    getDose: function(record, weight){
        var showWeight = true;
        if(record.get('dosage_units') && !record.get('dosage_units').match(/\/kg$/)){
            console.log('using animal as unit');
            showWeight = false;
            weight = 1;
        }
        else {

        }

        var vol = Ext4.util.Format.round(weight * record.get('dosage') / record.get('concentration'), 2);

        //NOTE: calculated from volume to avoid errors due to rounding
        var amount = Ext4.util.Format.round(vol * record.get('concentration'), 2);

        record.set('amount', amount);
        record.set('volume', vol);
        record.set('dosage', record.get('dosage'));
    }
});