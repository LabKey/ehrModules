/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//This will contain custom ext components
Ext.namespace('EHR.ext', 'EHR.ext.plugins', 'Ext.ux.form');


LABKEY.requiresScript("/ehr/ext.ux.multiselect.js");
LABKEY.requiresScript('Ext.ux.form.LovCombo.js');
LABKEY.requiresCss('Ext.ux.form.LovCombo.css');

LABKEY.requiresScript("/ehr/ext.ux.datetimefield.js");
LABKEY.requiresScript("/ehr/datetime.js");



//the first section is more generic and might make sense to include in labkey




/* options:
valueField: the inputValue of the checkbox
displayField: the label of the checkbox
 */
EHR.ext.RemoteCheckboxGroup = Ext.extend(Ext.form.CheckboxGroup,
{
    initComponent: function()
    {
        Ext.apply(this, {
            name: this.name || Ext.id(),
            storeLoaded: false,
            items: [{name: 'placeholder', fieldLabel: 'Loading..'}],
            buffered: true,
            listeners: {
                scope: this
//                change: function(c){
//                    console.log('remote checkbox on change')
//                },
//                blur: function(c){
//                    console.log('remote checkbox on blur')
//                }
            },
            tpl : new Ext.XTemplate('<tpl for=".">' +
                  '{[values["' + this.valueField + '"] ? values["' + this.displayField + '"] : "'+ (this.lookupNullCaption ? this.lookupNullCaption : '[none]') +'"]}' +
                    //allow a flag to display both display and value fields
                    '<tpl if="'+this.showValueInList+'">{[values["' + this.valueField + '"] ? " ("+values["' + this.valueField + '"]+")" : ""]}</tpl>'+
                    '</tpl>')

        });

        if(this.value){
            this.value = [this.value];
        }

        EHR.ext.RemoteCheckboxGroup.superclass.initComponent.call(this, arguments);

        //we need to test whether the store has been created
        if(!this.store){
            console.log('EHR.ext.RemoteCheckboxGroup requires a store');
            return;
        }

        if(this.store && !this.store.events)
            this.store = Ext.create(this.store, 'labkey-store');

        if(!this.store.getCount()) {
            this.store.on('load', this.onStoreLoad, this, {single: true});
        }
        else {
            this.onStoreLoad();
        }
    }

    ,onStoreLoad : function() {
        var item;
        this.store.each(function(record, idx){
            item = this.newItem(record);

            if(this.rendered){
                this.items.add(item);
                var col = (idx+this.columns.length) % this.columns.length;
                var chk = this.panel.getComponent(col).add(item);
                this.fireEvent('add', this, chk);
            }
            else {
                this.items.push(item)
            }
        }, this);

        //remove the placeholder checkbox
        if(this.rendered) {
            var item = this.items.first();
            this.items.remove(item);
            this.panel.getComponent(0).remove(item, true);
            this.ownerCt.doLayout();
        }
        else
            this.items.remove(this.items[0]);

        this.storeLoaded = true;
        this.buffered = false;

        if(this.bufferedValue){
            this.setValue(this.bufferedValue);
        }
    }
    ,newItem: function(record){
        return new Ext.form.Checkbox({
            xtype: 'checkbox',
            boxLabel: (this.tpl ? this.tpl.apply(record.data) : record.get(this.displayField)),
            inputValue: record.get(this.valueField),
            name: record.get(this.valueField),
            disabled: this.disabled,
            readOnly: this.readOnly || false,
            listeners: {
                scope: this,
                change: function(self, val){
                    //console.log('checkbox changed');
                    this.fireEvent('change', this, this.getValue());
                },
                check: function(self, val){
                    //console.log('checkbox checked');
                    this.fireEvent('change', this, this.getValue());
                }
            }
        });

    }
    ,setValue: function(v)
    {
        //NOTE: we need to account for an initial value if store not loaded.
        if(!this.storeLoaded){
            this.buffered = true;
            this.bufferedValue = v;
        }
        else {
            EHR.ext.RemoteCheckboxGroup.superclass.setValue.apply(this, arguments);
        }
    }
    ,setReadOnly : function(readOnly){
        EHR.ext.RemoteCheckboxGroup.superclass.setReadOnly.apply(this, arguments);
        this.setDisabled(readOnly);
    }
});
Ext.reg('ehr-remotecheckboxgroup', EHR.ext.RemoteCheckboxGroup);


EHR.ext.DisplayField = Ext.extend(Ext.form.DisplayField,
{
    initComponent: function()
    {
        this.tpl = '<div>hello</div>';
        EHR.ext.DisplayField.superclass.initComponent.apply(this, arguments);
    },
    getDisplayValue: function(v){
        if(this.lookup && lookups !== false){
            return v;
        }
        else if(Ext.isDate(v)){
            return this.format ? v.format(this.format) : v.format('Y-m-d H:i');
        }
        else
            return v;
    },

    setRawValue : function(v){
        if(this.htmlEncode){
            v = Ext.util.Format.htmlEncode(v);
        }
        return this.rendered ? (this.el.dom.innerHTML = (Ext.isEmpty(v) ? '' : v)) : (this.value = v);
    },

    setValue: function(v){
        this.displayValue = this.getDisplayValue(v);
        this.data = this.displayValue;
        EHR.ext.DisplayField.superclass.setValue.apply(this, arguments);
    }
});
Ext.reg('ehr-displayfield', EHR.ext.DisplayField);


/* options:
valueField: the inputValue of the radio
displayField: the label of the radio
 */
//adapted from:
//http://www.sencha.com/forum/showthread.php?95860-Remote-Loading-Items-Remote-Checkbox-Group-Ext.ux.RemoteCheckboxGroup&highlight=checkboxgroup+event
EHR.ext.RemoteRadioGroup = Ext.extend(Ext.form.RadioGroup,
{
    initComponent: function()
    {
        Ext.apply(this, {
            name: this.name || Ext.id(),
            storeLoaded: false,
            items: [{name: 'placeholder', fieldLabel: 'Loading..'}],
            buffered: true,
            listeners: {
                scope: this
//                change: function(c){
//                    console.log('remote radio on change')
//                },
//                blur: function(c){
//                    console.log('remote radio on blur')
//                }
            },
            tpl : new Ext.XTemplate('<tpl for=".">' +
                  '{[values["' + this.valueField + '"] ? values["' + this.displayField + '"] : "'+ (this.lookupNullCaption ? this.lookupNullCaption : '[none]') +'"]}' +
                    //allow a flag to display both display and value fields
                    '<tpl if="'+this.showValueInList+'">{[values["' + this.valueField + '"] ? " ("+values["' + this.valueField + '"]+")" : ""]}</tpl>'+
                    '</tpl>')
        });

        if(this.value!==undefined){
            this.value = [this.value];
        }

        EHR.ext.RemoteRadioGroup.superclass.initComponent.call(this, arguments);

        //we need to test whether the store has been created
        if(!this.store){
            console.log('EHR.ext.RemoteRadioGroup requires a store');
            return;
        }

        if(this.store && !this.store.events)
            this.store = Ext.create(this.store, 'labkey-store');

        if(!this.store.getCount()) {
            this.store.on('load', this.onStoreLoad, this, {single: true});
        }
        else {
            this.onStoreLoad();
        }
    },

    onStoreLoad: function(){
        var item;
        this.store.each(function(record, idx){
            item = this.newItem(record);
            //this.relayEvents(item, ['change', 'check']);

            if(this.rendered){
                this.items.add(item);
                var col = (idx+this.columns.length) % this.columns.length;
                var chk = this.panel.getComponent(col).add(item);
                this.fireEvent('add', this, chk);
            }
            else {
                this.items.push(item)
            }
        }, this);

        //remove the placeholder radio
        if(this.rendered) {
            item = this.items.first();
            this.items.remove(item);
            this.panel.getComponent(0).remove(item, true);
            this.ownerCt.doLayout();
        }
        else
            this.items.remove(this.items[0]);

        this.buffered = false;
        this.storeLoaded = true;

        if(this.initialValue!==undefined){
            //console.log('setting initial value: '+this.dataIndex+'/'+this.initialValue)
            this.setValue(this.initialValue);
        }

        if(this.readOnly)
            this.setReadOnly(true);

    },
    newItem: function(record){
        return new Ext.form.Radio({
            xtype: 'radio',
            boxLabel: (this.tpl ? this.tpl.apply(record.data) : record.get(this.displayField)),
            //NOTE: Ext is going to convert this to a string later anyway
            //be careful will null and similar values
            inputValue: record.get(this.valueField)===null ? '' : record.get(this.valueField),
            name: this.name,
            //checked: record.get(this.valueField)==this.initialValue,
            readOnly: this.readOnly || false,
            bubbleEvents: ['blur', 'change', 'check'],
            disabled: this.disabled,
            //NOTE: checkboxgroup doesnt fire change otherwise
            listeners: {
                scope: this,
                change: function(self, val){
                    //console.log('radio changed');
                    this.fireEvent('change', this, this.getValue());
                },
                check: function(self, val){
                    //console.log('radio checked');
                    this.fireEvent('change', this, this.getValue());
                }
            }
        });
    },
    setValue: function(v)
    {
        //NOTE: we need to account for an initial value if store not loaded.
        if(!this.storeLoaded){
            this.buffered = true;
            this.value = [v];
            this.bufferedValue = v;
            this.initialValue = v;
            //console.log('buffering value: '+this.dataIndex+'/'+v)
        }
        else {
            Ext.form.RadioGroup.superclass.setValue.apply(this, arguments);
        }
    },
    setReadOnly : function(readOnly){
        EHR.ext.RemoteCheckboxGroup.superclass.setReadOnly.apply(this, arguments);
        this.setDisabled(readOnly);
    }
});
Ext.reg('ehr-remoteradiogroup', EHR.ext.RemoteRadioGroup);


//this is a combobox containing operators as might be used in a search form
EHR.ext.OperatorCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(config){
        this.meta = this.meta || {};
        this.meta.jsonType = this.meta.jsonType || 'string';

        if(!this.initialValue){
            switch(this.meta.jsonType){
                case 'int':
                case 'float':
                    this.initialValue = 'eq';
                    break;
                case 'date':
                    this.initialValue = 'dateeq';
                    break;
                case 'boolean':
                    this.initialValue = 'startswith';
                    break;
                default:
                    this.initialValue = 'startswith';
                    break;
            }
        }

        Ext.apply(this, {
            xtype: 'combo'
            ,valueField:'value'
            ,displayField:'text'
            ,listWidth: 200
            ,typeAhead: false
            ,mode: 'local'
            ,triggerAction: 'all'
            ,editable: false
            ,value: this.initialValue
            ,store: this.setStore(this.meta, this.initialValue)
        });

        EHR.ext.OperatorCombo.superclass.initComponent.call(this)
    },
    setStore: function (meta, value) {
        var found = false;
        var options = [];
        if (meta.jsonType)
            Ext.each(LABKEY.Filter.getFilterTypesForType(meta.jsonType, meta.mvEnabled), function (filterType) {
                if (value && value == filterType.getURLSuffix())
                    found = true;
                if (filterType.getURLSuffix())
                    options.push([filterType.getURLSuffix(), filterType.getDisplayText()]);
            });

        if (!found) {
            for (var key in LABKEY.Filter.Types) {
                var filterType = LABKEY.Filter.Types[key];
                if (filterType.getURLSuffix() == value) {
                    options.unshift([filterType.getURLSuffix(), filterType.getDisplayText()]);
                    break;
                }
            }
        }

        return new Ext.data.ArrayStore({fields: ['value', 'text'], data: options });
    }
});
Ext.reg('ehr-operatorcombo', EHR.ext.OperatorCombo);

EHR.ext.BooleanCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(){
        Ext.apply(this, {
            displayField: 'displayText'
            ,valueField: 'value'
            ,triggerAction: 'all'
            ,listWidth: 200
            ,forceSelection: true
            ,mode: 'local'
            ,store: new Ext.data.ArrayStore({
                fields: [
                    'value',
                    'displayText'
                ],
                idIndex: 0,
                data: [
                    [false, 'No'],
                    [true, 'Yes']
                ]
            })
        });

        EHR.ext.BooleanCombo.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-booleancombo', EHR.ext.BooleanCombo);

EHR.ext.ViewCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(){
        Ext.apply(this, {
            displayField: 'displayText'
            ,valueField: 'value'
            ,triggerAction: 'all'
            ,mode: 'local'
            ,store: new Ext.data.ArrayStore({
                fields: [
                    'value',
                    'displayText'
                ],
                idIndex: 0,
                data: []
            })
        });

        EHR.ext.ViewCombo.superclass.initComponent.call(this);

        LABKEY.Query.getQueryViews({
            containerPath: this.containerPath
            ,queryName: this.queryName
            ,schemaName: this.schemaName
            ,successCallback: this.onViewLoad
            ,failure: EHR.utils.onError
            ,scope: this
        });

    },
    onViewLoad: function(data){
        if(!data || !data.views)
            return;

        var recs = [];
        var hasDefault = false;
        Ext.each(data.views, function(s){
            if(s.hidden)
                return;

            if(!s.name)
                hasDefault = true;
            recs.push([s.name, s.name || 'Default']);
        }, this);

        if(!hasDefault)
            recs.push(['', 'Default']);

        this.store.loadData(recs);
        this.store.sort('value');

        if(this.initialValue || this.initialConfig.initialValue)
            this.setValue(this.initialValue || this.initialConfig.initialValue)
    }
});
Ext.reg('ehr-viewcombo', EHR.ext.ViewCombo);


EHR.ext.ContainerFilterCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(){
        Ext.apply(this, {
            displayField: 'displayText'
            ,valueField: 'value'
            ,triggerAction: 'all'
            ,listWidth: 200
            ,forceSelection: true
            ,mode: 'local'
            ,store: new Ext.data.ArrayStore({
                fields: [
                    'value',
                    'displayText'
                ],
                idIndex: 0,
                data: [
                    ['', 'Current Folder Only'],
                    ['CurrentAndSubfolders', 'Current Folder and Subfolders']
                ]
            })
        });

        EHR.ext.ContainerFilterCombo.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-containerfiltercombo', EHR.ext.ContainerFilterCombo);



EHR.ext.TriggerNumberField = function(config){
    EHR.ext.TriggerNumberField.superclass.constructor.call(this, config);
};
Ext.extend(EHR.ext.TriggerNumberField, Ext.form.TriggerField, {
    baseChars : "0123456789",


/**
     * @cfg {Boolean} autoStripChars True to automatically strip not allowed characters from the field. Defaults to false
     */
    autoStripChars: false,
    allowDecimals : true,

/**
     * @cfg {String} decimalSeparator Character(s) to allow as the decimal separator (defaults to '.')
     */
    decimalSeparator : ".",

/**
     * @cfg {Number} decimalPrecision The maximum precision to display after the decimal separator (defaults to 2)
     */
    decimalPrecision : 2,

/**
     * @cfg {Boolean} allowNegative False to prevent entering a negative sign (defaults to true)
     */
    allowNegative : true,

    // private
    initEvents : function() {
        var allowed = this.baseChars + '';
        if (this.allowDecimals) {
            allowed += this.decimalSeparator;
        }
        if (this.allowNegative) {
            allowed += '-';
        }
        allowed = Ext.escapeRe(allowed);
        this.maskRe = new RegExp('[' + allowed + ']');
        if (this.autoStripChars) {
            this.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
        }

        Ext.form.NumberField.superclass.initEvents.call(this);
    }

});
Ext.reg('ehr-triggernumberfield', EHR.ext.TriggerNumberField);

//this is a component that will either be true or null.
//this is done such that the box will fail client-side validation unless checked
EHR.ext.ApproveRadio = Ext.extend(Ext.form.RadioGroup, {
    initComponent: function() {
        Ext.apply(this, {
            allowBlank: false,
            items: [{
                xtype: 'radio',
                name: this.id,
                inputValue: '',
                boxLabel: 'No',
                checked: true
            },{
                xtype: 'radio',
                name: this.id,
                inputValue: 'true',
                boxLabel: 'Yes',
                allowBlank: false
            }]
        });

        EHR.ext.ApproveRadio.superclass.initComponent.call(this, arguments);
    },
    setValue: function(v)
    {
        if(Ext.isBoolean(v)){
            v = String(v);
        }
        if(v != 'true'){
            v = '';
        }
        EHR.ext.ApproveRadio.superclass.setValue.apply(this, [v]);
    },
    getValue: function()
    {
        var val = EHR.ext.ApproveRadio.superclass.getValue.apply(this, arguments);
        if(val && val.inputValue != 'true'){
            val = null;
        }
        return val;

    }

});
Ext.reg('ehr-approveradio', EHR.ext.ApproveRadio);


EHR.ext.UserEditableCombo = Ext.extend(LABKEY.ext.ComboBox, {
    initComponent: function(config){
        this.plugins = this.plugins || [];
        this.plugins.push('ehr-usereditablecombo');

        EHR.ext.UserEditableCombo.superclass.initComponent.call(this, config);
    }
});
Ext.reg('ehr-usereditablecombo', EHR.ext.UserEditableCombo);


EHR.ext.plugins.UserEditableCombo = Ext.extend(Ext.util.Observable, {
    init: function(combo) {
        Ext.apply(combo, {
            onSelect: function(cmp, idx){
                var val;
                if(idx)
                    val = this.store.getAt(idx).get(this.valueField);

                if(val == 'Other'){
                    Ext.MessageBox.prompt('Enter Value', 'Enter value:', this.addNewValue, this);
                }
                LABKEY.ext.ComboBox.superclass.onSelect.apply(this, arguments);
            },
            setValue:     function(v){
                var r = this.findRecord(this.valueField, v);
                if(!r){
                    this.addRecord(v, v);
                }
                LABKEY.ext.ComboBox.superclass.setValue.apply(this, arguments);
            },
            addNewValue: function(btn, val){
                this.addRecord(val);
                this.setValue(val);
                this.fireEvent('change', this, val, 'Other');
            },
            addRecord: function(value){
                if(!value)
                    return;

                var data = {};
                data[this.valueField] = value;
                if(this.displayField!=this.valueField){
                    data[this.displayField] = value;
                }

                if(!this.store || !this.store.fields){
                    this.store.on('load', function(store){
                        this.addRecord(value);
                    }, this, {single: true});
                    console.log('unable to add record: '+this.store.storeId+'/'+value);
                    return;
                }
                this.store.add((new this.store.recordType(data)));

                if(this.view){
                    this.view.setStore(this.store);
                    this.view.refresh()
                }
            }
        });

        if(combo.store.fields)
            combo.addRecord('Other');
        else
            combo.store.on('load', function(){
                combo.addRecord('Other');
            }, this);
    }
});
Ext.preg('ehr-usereditablecombo', EHR.ext.plugins.UserEditableCombo);



EHR.ext.plugins.ResizableTextArea = Ext.extend(Ext.util.Observable, {
    init: function(textArea){
        textArea.resizeDirections = textArea.resizeDirections || 's,se,e';
        textArea.on("render", function(f){
            f.resizer=new Ext.Resizable(f.getEl(),{handles:this.resizeDirections,wrap:true});
            f.resizer.on('resize',function(){delete f.anchor;});
        }, textArea);

        textArea.onResizeOld = textArea.onResize;
        textArea.onResize = function(){
            this.onResizeOld.apply(this, arguments);
            var r = this.resizer;
            var csize = r.getResizeChild().getSize();
            r.el.setSize(csize.width, csize.height);
        }
    }
});
Ext.preg('ehr-resizabletextarea', EHR.ext.plugins.ResizableTextArea);

//these components tend to be EHR specific


EHR.ext.SnomedCombo = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function()
    {
        Ext.apply(this, {
            triggerAction: 'all',
            displayField: 'code/meaning',
            valueField: 'code',
            typeAhead: true,
            mode: 'local',
            listWidth: 300,
            allowAnyValue: true,
            store: new LABKEY.ext.Store({
                xtype: 'labkey-store',
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subset_codes',
                columns: 'secondaryCategory,code,code/meaning',
                sort: 'secondaryCategory,code/meaning',
                storeId: ['ehr_lookups', 'snomed', 'code', 'meaning', this.queryName, (this.dataIndex || this.name)].join('||'),
                maxRows: 0,
                autoLoad: false
            }),
            tpl : function(){var tpl = new Ext.XTemplate(
                '<tpl for=".">' +
                  '<div class="x-combo-list-item">' +
                    '{[ values["secondaryCategory"] ? "<b>"+values["secondaryCategory"]+":</b> "  : "" ]}' +
                    '{[ (values["meaning"] || values["code/meaning"]) ? (values["meaning"] || values["code/meaning"])+" ("+values["code"]+")" : ' +
                        'values["code"]]}' +
                    '&nbsp;</div></tpl>'
            );return tpl.compile()}()
        });

        EHR.ext.SnomedCombo.superclass.initComponent.call(this, arguments);

        this.filterComboCfg = {};
    },

    onRender: function(){
        EHR.ext.SnomedCombo.superclass.onRender.apply(this, arguments);

        //if there is a storeCfg property, we render a combo with common remarks
        if(this.filterComboCfg){
            this.addCombo();
        }

    },
    addCombo: function(){
        var div = this.container.insertFirst({
            tag: 'div',
            style: 'padding-bottom: 5px;'
        });

        var config = Ext.applyIf(this.filterComboCfg, {
            xtype: 'combo',
            renderTo: div,
            width: this.width,
            disabled: this.disabled,
            emptyText: 'Pick subset...',
            typeAhead: true,
            mode: 'local',
            isFormField: false,
            boxMaxWidth: 200,
            valueField: 'subset',
            displayField: 'subset',
            triggerAction: 'all',
            initialValue: this.defaultSubset,
            value: this.defaultSubset,
            nullCaption: 'All',
            store: new LABKEY.ext.Store({
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subsets',
                sort: 'subset',
                //NOTE: this can potentially be a lot of records, so we initially load with zero
                //maxRows: 0,
                autoLoad: true,
                listeners: {
                    scope: this,
                    load: function(s){
                        s.addRecord({subset: 'SNOMED Codes'})
                    }
                },
                nullRecord: {
                    displayColumn: 'subset',
                    nullCaption: 'All'
                }
            }),
            listeners: {
                scope: this,
                change: this.applyFilter
            }
        });

        this.filterCombo = Ext.ComponentMgr.create(config);
        if(this.defaultSubset){
            this.applyFilter(this.filterCombo, this.defaultSubset)
        }
    },

    applyFilter: function(combo, subset){
        this.store.removeAll();
        delete this.store.baseParams['query.maxRows'];

        if(!subset || subset == 'All'){
            this.store.baseParams['query.queryName'] = 'snomed';
            this.store.baseParams['query.columns'] = 'code,meaning';
            this.store.baseParams['query.sort'] = 'meaning';
            this.store.sortInfo.field = 'meaning';
            if(this.store.sortInfo)
                delete this.store.baseParams['query.primaryCategory~eq'];
            this.displayField = 'meaning';
        }
        else if (subset == 'SNOMED Codes'){
             this.store.baseParams['query.queryName'] = 'snomed';
            this.store.baseParams['query.columns'] = 'code';
            this.store.baseParams['query.sort'] = 'code';
            this.store.sortInfo.field = 'code';
            if(this.store.sortInfo)
                delete this.store.baseParams['query.primaryCategory~eq'];
            this.displayField = 'code';
        }
        else {
            LABKEY.Filter.appendFilterParams(this.store.baseParams, [LABKEY.Filter.create('primaryCategory', subset, LABKEY.Filter.Types.EQUAL)]);
            this.store.baseParams['query.queryName'] = 'snomed_subset_codes';
            this.store.baseParams['query.columns'] = 'secondaryCategory,code,code/meaning';
            this.store.baseParams['query.sort'] = 'secondaryCategory,code/meaning';
            if(this.store.sortInfo)
                this.store.sortInfo.field = 'secondaryCategory,code/meaning';
            this.displayField = 'code/meaning';
        }

        this.store.load();

        if(this.view)
            this.view.setStore(this.store);

    },

    setDisabled: function(val){
        EHR.ext.SnomedCombo.superclass.setDisabled.call(this, val);

        if(this.filterCombo)
            this.filterCombo.setDisabled(val);
    },
    setVisible: function(val){
        EHR.ext.SnomedCombo.superclass.setVisible.call(this, val);

        if(this.filterCombo)
            this.filterCombo.setVisible(val);
    },
    reset: function(){
        EHR.ext.SnomedCombo.superclass.reset.call(this);

        if(this.filterCombo)
            this.filterCombo.reset();
    }
//    doQuery : function(q, forceAll){
//        q = Ext.isEmpty(q) ? '' : q;
//        var qe = {
//            query: q,
//            forceAll: forceAll,
//            combo: this,
//            cancel:false
//        };
//        if(this.fireEvent('beforequery', qe)===false || qe.cancel){
//            return false;
//        }
//        q = qe.query;
//        forceAll = qe.forceAll;
//        if(forceAll === true || (q.length >= this.minChars)){
//            if(this.lastQuery !== q){
//                this.lastQuery = q;
//                if(this.mode == 'local'){
//                    this.selectedIndex = -1;
//                    if(forceAll){
//                        this.store.clearFilter();
//                    }else{
//                        this.store.filter(this.displayField, q, this.allowAnyValue, this.caseSensitive);
//                    }
//                    this.onLoad();
//                }else{
//                    this.store.baseParams[this.queryParam] = q;
//                    this.store.load({
//                        params: this.getParams(q)
//                    });
//                    this.expand();
//                }
//            }else{
//                this.selectedIndex = -1;
//                this.onLoad();
//            }
//        }
//    }
});
Ext.reg('ehr-snomedcombo', EHR.ext.SnomedCombo);



EHR.ext.ParticipantField = Ext.extend(Ext.form.TextField,
{
    initComponent: function()
    {
        Ext.apply(this, {
            labelAlign: 'top'
            ,fieldLabel: 'Id'
            ,allowBlank: false
            //,bubbleEvents: ['valid', 'invalid', 'added']
            ,participantMap: new Ext.util.MixedCollection
            ,validationDelay: 1000
            ,validationEvent: 'blur'
            ,validator: function(val)
            {
                if (!val)
                {
                    //we let the field's allowBlank handle this
                    return true;
                }
//
                //force lowercase
                val = val.toLowerCase();

                //trim whitespace
                val = val.replace(/^\s+|\s+$/g,"");

                if(val != this.getValue())
                    this.setValue(val);

                var species;
                if (val.match(/(^rh([0-9]{4})$)|(^r([0-9]{5})$)|(^rh-([0-9]{3})$)|(^rh[a-z]{2}([0-9]{2})$)/))
                    species = 'Rhesus';
                else if (val.match(/^cy([0-9]{4})$/))
                    species = 'Cynomolgus';
                else if (val.match(/^ag([0-9]{4})$/))
                    species = 'Vervet';
                else if (val.match(/^cj([0-9]{4})$/))
                    species = 'Marmoset';
                else if (val.match(/^so([0-9]{4})$/))
                    species = 'Cotton-top Tamarin';
                else if (val.match(/^pt([0-9]{4})$/))
                    species = 'Pigtail';
                else if (val.match(/^pd([0-9]{4})$/))
                    species = '';
                else if (val.match(/^test([0-9]+)$/))
                    species = 'Rhesus';
//
//                if(!species){
//                    return 'Invalid Id Format';
//                }
//
//                var row = this.participantMap.get(val);
//                if(row && !row.loading && !this.allowAnyId){
//                    if(!row.Id){
//                        return 'Id Not Found';
//                    }
//                }
//
                return true;
//
            }
            ,listeners: {
                scope: this,
                valid: function(c)
                {
                    var val = c.getRawValue();
                    if (val != c.loadedId)
                    {
                        this.fireEvent('participantchange', this, val);
                        c.loadedId = val;
                    }
                },
                invalid: function(c)
                {
                    var val = c.getRawValue();
                    if (val != c.loadedId){
                        this.fireEvent('participantchange', this, val);
                        c.loadedId = val;
                    }
                },
                render: function(field){
                    field.el.set({spellcheck: false});
                }
            }
        });

        EHR.ext.ParticipantField.superclass.initComponent.call(this, arguments);

        this.addEvents('participantchange');
        this.enableBubble('participantchange');

    }
});
Ext.reg('ehr-participant', EHR.ext.ParticipantField);



EHR.ext.ProjectField = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function()
    {

        Ext.apply(this, {
            fieldLabel: 'Project'
            ,name: this.name || 'project'
            ,dataIndex: 'project'
            ,emptyText:''
            ,displayField:'project'
            ,valueField: 'project'
            ,typeAhead: true
            ,triggerAction: 'all'
            ,forceSelection: true
            ,mode: 'local'
            ,disabled: false
            ,plugins: ['ehr-usereditablecombo']
            ,validationDelay: 500
            //NOTE: unless i have this empty store an error is thrown
            ,store: new LABKEY.ext.Store({
                containerPath: 'WNPRC/EHR/',
                schemaName: 'study',
                sql: this.makeSql(),
                sort: 'project',
                autoLoad: true
            })
            ,listeners: {
                select: function(combo, rec){
                    if(this.ownerCt.boundRecord){
                        this.ownerCt.boundRecord.beginEdit();
                        this.ownerCt.boundRecord.set('project', rec.get('project'));
                        this.ownerCt.boundRecord.set('account', rec.get('account'));
                        this.ownerCt.boundRecord.endEdit();
                    }
                }
            }
//            ,tpl: function(){var tpl = new Ext.XTemplate(
//                '<tpl for=".">' +
//                '<div class="x-combo-list-item">{[!isNaN(values["project"]) ? EHR.utils.padDigits(values["project"], 8) : values["project"]]}' +
//                '&nbsp;</div></tpl>'
//            );return tpl.compile()}()
            ,tpl: function(){var tpl = new Ext.XTemplate(
                '<tpl for=".">' +
                '<div class="x-combo-list-item">{[values["project"] + " " + (values["protocol"] ? "("+values["protocol"]+")" : "")]}' +
                '&nbsp;</div></tpl>'
            );return tpl.compile()}()
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this, arguments);

        this.mon(this.ownerCt, 'participantchange', this.getProjects, this);
    },
    makeSql: function(id, date){
        var sql = "SELECT DISTINCT a.project, a.project.account, a.project.protocol as protocol FROM study.assignment a " +
                "WHERE a.id='"+id+"' " +
                //this protocol contains tracking projects
                "AND a.project.protocol != 'wprc00' ";

        if(!this.allowAllProtocols){
            sql += ' AND a.project.protocol IS NOT NULL '
        }

        if(date)
            sql += "AND a.date <= '"+date.format('Y-m-d')+"' AND (a.enddate >= '"+date.format('Y-m-d')+"' OR a.enddate IS NULL)";
        else
            sql += "AND a.enddate IS NULL ";

        if(this.defaultProjects){
            sql += " UNION ALL (SELECT project, account, project.protocol as protocol FROM lists.project WHERE project IN ('"+this.defaultProjects.join("','")+"'))";
        }

        return sql;
    },
    getProjects : function(field, id)
    {
        if(!id && this.ownerCt.boundRecord)
            id = this.ownerCt.boundRecord.get('Id');

        var date;
        if(this.ownerCt.boundRecord){
            date = this.ownerCt.boundRecord.get('date');
        }

        this.emptyText = 'Select project...';
        this.store.baseParams.sql = this.makeSql(id, date);
        this.store.load();

    }
});
Ext.reg('ehr-project', EHR.ext.ProjectField);


EHR.ext.RemarkField = Ext.extend(Ext.form.TextArea,
{
    initComponent: function(){
        this.plugins = this.plugins || [];
        this.plugins.push('ehr-resizabletextarea');

        EHR.ext.RemarkField.superclass.initComponent.call(this);
    },
    onRender: function(){
        EHR.ext.RemarkField.superclass.onRender.apply(this, arguments);

        //if there is a storeCfg property, we render a combo with common remarks
        if(this.storeCfg){
            this.addCombo();
        }

    },
    addCombo: function(){
        var div = this.container.insertFirst({
            tag: 'div',
            style: 'padding-bottom: 5px;'
        });

        this.select = Ext.ComponentMgr.create({
            xtype: 'combo',
            renderTo: div,
            emptyText: 'Common remarks...',
            width: this.width,
            disabled: this.disabled,
            isFormField: false,
            boxMaxWidth: 200,
            valueField: this.storeCfg.valueField,
            displayField: this.storeCfg.displayField,
            triggerAction: 'all',
            store: new LABKEY.ext.Store({
                schemaName: this.storeCfg.schemaName,
                queryName: this.storeCfg.queryName,
                autoLoad: true
            }),
            listeners: {
                scope: this,
                select: function(combo, rec){
                    var val = combo.getValue();
                    this.setValue(val);
                    this.fireEvent('change', this, val, this.startValue);
                    combo.reset();
                }
            }
        });
    },

    setDisabled: function(val){
        EHR.ext.RemarkField.superclass.setDisabled.call(this, val);

        if(this.select)
            this.select.setDisabled(val);
    },
    setVisible: function(val){
        EHR.ext.RemarkField.superclass.setVisible.call(this, val);

        if(this.select)
            this.select.setVisible(val);
    }
});
Ext.reg('ehr-remark', EHR.ext.RemarkField);


EHR.ext.DrugDoseField = Ext.extend(EHR.ext.TriggerNumberField,
{
    initComponent: function(){
        this.triggerClass = 'x-form-search-trigger';

        EHR.ext.DrugDoseField.superclass.initComponent.call(this, arguments);
    },
    onTriggerClick: function(){
        var id, conc, dosage, conc_units;
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
            Ext.Msg.alert('Error', 'Must supply Id, dosage and concentration');
            return
        }

        if(parent.importPanel.participantMap.get(id)){
            var weight;
            var showWeight = true;
            if(values.dosage_units && !values.dosage_units.match(/\/kg$/)){
                //console.log('using animal as unit');
                showWeight = false;
                weight = 1;
            }
            else {
                var weightStore = Ext.StoreMgr.find(function(s){
                    if(s.queryName=='Weight'){
                        var r = s.find('Id', id);
                        if(r != -1){
                            r = s.getAt(r);
                            weight = r.get('weight');
                        }
                    }
                }, this);

                if(!weight){
                    var record = parent.importPanel.participantMap.get(id);
                    weight = record['Id/availBlood/MostRecentWeight'] || record['Id/mostRecentWeight/MostRecentWeight']  || record['Id/MostRecentWeight/MostRecentWeight'];
                }

                if(weight){
                    var mt = Ext.form.MessageTargets.under;
                    var msg;
                    if(showWeight)
                        msg = 'Weight: '+weight+' kg';
                    else
                        msg = null;

                    if(mt){
                        mt.mark(this, msg);
                        function onBindChange(){
                            mt.mark(this, null);
                            this.ownerCt.doLayout();
                        }
                        parent.on('recordchange', onBindChange, this, {single: true});
                        this.ownerCt.doLayout();
                    }
                }
                else {
                    alert('Unable to find weight');
                    return;
                }
            }

            var vol = EHR.utils.roundNumber(weight*dosage/conc, 2);
            //var amount = EHR.utils.roundNumber(weight*dosage, 2);

            //NOTE: calculated from volume to avoid errors due to rounding
            var amount = EHR.utils.roundNumber(vol*conc, 2);

            theForm.findField('amount').setValue(amount);
            theForm.findField('volume').setValue(vol);
            theForm.findField('dosage').setValue(dosage);

            //we only fire 1 event b/c the databind plugin operates on the form as a whole
            var concField = theForm.findField('concentration');
            concField.setValue(conc);
            concField.fireEvent('change', conc, concField.startValue);
        }
        else {
            parent.importPanel.participantMap.on('add', this.onTriggerClick, this, {single: true})
        }
    }
});
Ext.reg('ehr-drugdosefield', EHR.ext.DrugDoseField);


//this vtype is used in date range panels
Ext.apply(Ext.form.VTypes, {
    daterange : function(val, field)
    {
        var date = field.parseDate(val);
        console.log('validating');
        if (!date)
        {
            console.log('returned');
            return;
        }
        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime())))
        {
            //var start = Ext.getCmp(field.startDateField);
            var start = field.startDateField;
            start.setMaxValue(date);
            //start.validate.defer(10);
            this.dateRangeMax = date;

            start.fireEvent('change', start, start.getValue(), start.startValue);
        }
        else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime())))
        {
            //var end = Ext.getCmp(field.endDateField);
            var end = field.endDateField;
            end.setMinValue(date);
            //end.validate.defer(10);
            this.dateRangeMin = date;

            end.fireEvent('change', end, end.getValue());
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */

        return true;
    }
});

