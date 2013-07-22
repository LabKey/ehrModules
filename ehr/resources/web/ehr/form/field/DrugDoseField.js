/**
 * A trigger field which only allows numeric characters
 */
Ext4.define('EHR.form.field.DrugDoseField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.ehr-drugdosefield',

    triggerCls: 'x4-form-search-trigger',

    initComponent: function(){
        this.callParent(arguments);
    },

    onTriggerClick: function(){
        var id, conc, dosage;
        var parent = this.findParentByType('ehr-formpanel');
        var theForm = parent.getForm();

        var values = theForm.getFieldValues();
        conc = values.concentration;
        dosage = values.dosage;

        //note: if this form is an encounter, Id might be inherited, so we use the record as a fallback
        id = values.Id;
        if(!id && parent.boundRecord)
            id = parent.boundRecord.get('Id');

        if(!conc || !dosage || !id){
            Ext4.Msg.alert('Error', 'Must supply Id, dosage and concentration');
            return
        }

        var sc = parent.store.storeCollection;
        if (sc){
            this.calculateDose(id, values, sc);
        }
    },

    calculateDose: function(id, values, sc){
        EHR.DemographicsCache.getDemographics(id, function(animalId, data){
            this.onDemographicsLoad(id, data, values, sc)
        }, this);
    },

    onDemographicsLoad: function(id, data, values, sc){
        var weight = this.getClientWeight(sc, id) || data.demographics.getValue('Id/mostRecentWeight/MostRecentWeight');
        console.log(weight);

        if (!weight){
            alert('Unable to find weight');
            return;
        }

        this.showWeight(weight);
        this.getDose(values, weight);

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
        if(weight){
            var msg = 'Weight: '+weight+' kg';

            this.getActionEl().dom.setAttribute('title', msg);

            //TODO: clear this value
        }
    },

    getDose: function(values, weight){
        var showWeight = true;
        if(values.dosage_units && !values.dosage_units.match(/\/kg$/)){
            //console.log('using animal as unit');
            showWeight = false;
            weight = 1;
        }
        else {

        }

        var vol = EHR.Utils.roundNumber(weight * values.dosage / values.conc, 2);

        //NOTE: calculated from volume to avoid errors due to rounding
        var amount = EHR.Utils.roundNumber(vol * values.conc, 2);

        theForm.findField('amount').setValue(amount);
        theForm.findField('volume').setValue(vol);
        theForm.findField('dosage').setValue(values.dosage);

        //we only fire 1 event b/c the databind plugin operates on the form as a whole
        var concField = theForm.findField('concentration');
        concField.setValue(values.conc);
        concField.fireEvent('change', values.conc, concField.startValue);
    }
});