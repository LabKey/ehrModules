/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//This will contain ext overrides
Ext.namespace('EHR.ext');



//a css fix for Ext datepicker and tabpanel
Ext.menu.DateMenu.prototype.addClass('extContainer');
Ext.TabPanel.prototype.addClass('extContainer');



//Ext's 3.1 documentation says this should be the code.
// the purpose is to allow null values in numeric fields
Ext.data.Types.INT.convert = function(v){
    return v !== undefined && v !== null && v !== '' ?
        parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
};

Ext.data.Types.FLOAT.convert = function(v){
    return v !== undefined && v !== null && v !== '' ?
        parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
};
Ext.form.Field.prototype.useNull = true;



Ext.override(Ext.form.CheckboxGroup, {
    getValueAsString: function(delim)
    {
        delim = delim || ',';
        var vals = [];
        Ext.each(this.getValue(), function(c){
            vals.push(c.inputValue);
        }, this);
        return vals.join(delim);
    },
    removeAll: function () {
        this.panel.items.each(function(col){
            col.items.each(function(item){
                this.items.remove(item);
                col.remove(item);
            })
        }, this);
    }
});

//Ext is going to coerse the value into a string, which doesnt work well when it's null
Ext.override(Ext.form.RadioGroup, {
    setValueForItem: function(val){
        val = (val===null ? '' : val);
        Ext.form.RadioGroup.superclass.setValueForItem.call(this, val);
    }
});


Ext.override(Ext.Panel, {
    setReadOnly: function(val){
        if(!this.items){
            console.log(this)
        }
        else {
            this.items.each(function(item){
                if(item.setReadOnly){
                    item.setReadOnly(val);
                }
                else {
                    item.setDisabled(val)
                }
            }, this);
        }
    }
});

//overridden b/c readOnly has no effect on checkboxes and radios.  this will disable the element, making it truly read only
Ext.override(Ext.form.Checkbox, {
    setReadOnly: function(val){
        Ext.form.Checkbox.superclass.setReadOnly.apply(this, arguments);
        this.setDisabled(val);
    }
});