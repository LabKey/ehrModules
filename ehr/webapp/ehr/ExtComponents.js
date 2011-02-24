/*
 * Copyright (c) 2010 LabKey Corporation
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
valueField: the values of the checkbox
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

        if(this.store && !this.store.getCount()) {
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
    setValue: function(v){
        this.displayValue = this.getDisplayValue(v);
        this.data = this.displayValue;
        EHR.ext.DisplayField.superclass.setValue.apply(this, arguments);
    }
});
Ext.reg('ehr-displayfield', EHR.ext.DisplayField);


/* options:
valueField: the values of the radio
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

        if(this.store && !this.store.getCount()) {
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
            var item = this.items.first();
            this.items.remove(item);
            this.panel.getComponent(0).remove(item, true);
            this.ownerCt.doLayout();
        }
        else
            this.items.remove(this.items[0]);

        this.buffered = false;
        this.storeLoaded = true;

        if(this.initialValue!==undefined){
            this.setValue(this.initialValue);
        }

        if(this.readOnly)
            this.setReadOnly(true)

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
            disabled: this.disabled,
            //NOTE: checkboxgroup doesnt fire change otherwise
            listeners: {
                scope: this,
                change: function(self, val){
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
        }
        else {
            Ext.form.RadioGroup.superclass.setValue.apply(this, arguments);
        }
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
            ,errorCallback: EHR.UTILITIES.onError
            ,scope: this
        });

    },
    onViewLoad: function(data){
        if(!data || !data.views)
            return;

        var recs = [];
        var hasDefault = false;
        Ext.each(data.views, function(s){
            if(!s.name)
                hasDefault = true;
            recs.push([s.name, s.name || 'Default']);
        }, this);

        if(!hasDefault)
            recs.push(['', 'Default']);

        this.store.loadData(recs);
        this.store.sort('value');
    }
});
Ext.reg('ehr-viewcombo', EHR.ext.ViewCombo);


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
                this.store.add((new this.store.recordType(data)));

                //TODO: get combo's listview to reflect this
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
            }, this, {single: true});
    }
});
Ext.preg('ehr-usereditablecombo', EHR.ext.plugins.UserEditableCombo);



//these components tend to be EHR specific


EHR.ext.SnomedCombo = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function()
    {
        Ext.apply(this, {
            triggerAction: 'all',
            displayField: 'code/meaning',
            valueField: 'code',
            mode: 'local',
            store: new LABKEY.ext.Store({
                //containerPath: rec.get('containerpath'),
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subset_codes',
                columns: 'secondaryCategory,code,code/meaning',
                sort: 'secondaryCategory,code/meaning',
                autoLoad: false
            }),
            tpl : function(){var tpl = new Ext.XTemplate(
                    '<tpl for=".">' +
                      '<div class="x-combo-list-item">{[ values["secondaryCategory"] ? "<b>"+values["secondaryCategory"]+":</b> "  : "" ]}{[ values["meaning"] || values["code/meaning"] ]}' +
                        //allow a flag to display both display and value fields
                        '{[" ("+values["code"]+")"]}'+
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
            valueField: 'primaryCategory',
            displayField: 'primaryCategory',
            triggerAction: 'all',
            initialValue: this.defaultSubset,
            nullCaption: 'All',
            store: new LABKEY.ext.Store({
                schemaName: 'ehr_lookups',
                queryName: 'snomed_subsets',
                autoLoad: true,
                nullRecord: {
                    displayColumn: 'primaryCategory',
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

        if(subset == 'All'){
            this.store.baseParams.schemaName = 'lists';
            this.store.baseParams['query.queryName'] = 'snomed';
            this.store.baseParams['query.columns'] = 'code,meaning';
            this.store.baseParams['query.sort'] = 'meaning';
            this.displayField = 'meaning';
        }
        else {
            this.store.baseParams.schemaName = 'ehr_lookups';
            LABKEY.Filter.appendFilterParams(this.store.baseParams, [LABKEY.Filter.create('primaryCategory', subset, LABKEY.Filter.Types.EQUAL)]);
            this.store.baseParams['query.queryName'] = 'snomed_subset_codes';
            this.store.baseParams['query.columns'] = 'secondaryCategory,code,code/meaning';
            this.store.baseParams['query.sort'] = 'secondaryCategory,code/meaning';
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
                    return 'This field is required';
                }

                //force lowercase
                if(val != val.toLowerCase()){
                    val = val.toLowerCase();
                    this.setValue(val);
                }

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

                if(!species) return 'Invalid Id Format';

                var row = this.participantMap.get(val);
                if(row && !row.loading){
                    if(!row.Id){
                        return 'Id Not Found';
                    }
                }

                return true;

            },
            listeners: {
                scope: this,
                valid: function(c)
                {
                    var val = c.getValue();

                    if (val != c.loadedId)
                    {
                        this.fireEvent('participantvalid', c);
                        c.loadedId = val;
                        //console.log('animal valid');
                    }
                },
                invalid: function(c)
                {
                    var val = c.getRawValue();
                    if (val != c.loadedId){
                        this.fireEvent('participantinvalid', c);
                        c.loadedId = val;
                        //console.log('animal invalid');
                    }
                }
            }
        });

        EHR.ext.ParticipantField.superclass.initComponent.call(this, arguments);

        this.addEvents('participantvalid', 'participantinvalid');
        this.enableBubble('participantvalid', 'participantinvalid');

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
            ,disabled: true
            ,defaultProjects: [00300901]
            ,validationDelay: 500
            //NOTE: unless i have this empty store an error is thrown
            ,store: new LABKEY.ext.Store({
                containerPath: 'WNPRC/EHR/',
                schemaName: 'study',
                queryName: 'assignment',
                viewName: 'Active Assignments',
                sort: 'project',
                columns: 'project,project/account',
                //tpl: '<tpl for="."><div class="x-combo-list-item">{' + this.displayField + '}</div></tpl>',
                filterArray: [LABKEY.Filter.create('Id', '', LABKEY.Filter.Types.EQUAL)],
                autoLoad: true,
                listeners: {
                    scope: this,
                    load: function(s)
                    {
                        if (this.defaultProjects)
                        {
                            Ext.each(this.defaultProjects, function(p)
                            {
                                var rec = new s.recordType({project: p});
                                s.addSorted(rec);
                            }, this);
                        }
                    }
                }
            })
            ,listeners: {
                select: function(combo, rec){
                    if(this.ownerCt.boundRecord){
                        this.ownerCt.boundRecord.set('project', rec.get('project'));
                        this.ownerCt.boundRecord.set('account', rec.get('project/account'));
                    }
                }
            }
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this, arguments);

        this.mon(this.ownerCt, 'participantvalid', this.onParticipantValid, this);
        this.mon(this.ownerCt, 'participantinvalid', this.onParticipantInValid, this);
    },
    onParticipantValid: function(c)
    {
        this.getProjects(c.getValue());
    },
    onParticipantInValid: function(c){
        this.store.baseParams['query.Id~eq'] = id;
        this.store.load();
        this.setDisabled(true);
        this.setValue(null);
        this.emptyText = '';
    },
    getProjects : function(id)
    {
        this.store.baseParams['query.Id~eq'] = id;
        this.store.baseParams['query.project/protocol~neq'] = 'wprc00';
        this.store.load();
        this.emptyText = 'Select project...';
        this.setDisabled(false);
    }
});
Ext.reg('ehr-project', EHR.ext.ProjectField);


EHR.ext.ProtocolField = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function()
    {
        Ext.apply(this, {
            fieldLabel: 'Protocol'
            ,name: this.name || 'Protocol'
            ,emptyText:'Select protocol...'
            ,displayField:'protocol'
            ,valueField: 'protocol'
            ,forceSelection: true
            ,triggerAction: 'all'
            ,typeAhead: true
            ,mode: 'local'
            ,store: EHR.ext.simpleLookupStore({
                containerPath: 'WNPRC/EHR/',
                schemaName: 'lists',
                queryName: 'protocol',
                sort: 'protocol'
            })
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this, arguments);
    }
});
Ext.reg('ehr-protocol', EHR.ext.ProtocolField);

EHR.ext.RemarkField = Ext.extend(Ext.form.TextArea,
{
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


EHR.ext.DrugDoseField = Ext.extend(Ext.form.TriggerField,
{
    initComponent: function(){
        this.triggerClass = 'x-form-search-trigger';

        EHR.ext.DrugDoseField.superclass.initComponent.call(this, arguments);
    },
    onRender: function(){
        EHR.ext.DrugDoseField.superclass.onRender.apply(this, arguments);
    },
    onTriggerClick: function(){
        var id, conc, dosage, conc_units;

        var parent = this.findParentByType('ehr-formpanel');
        if (parent){
            if(!parent.boundRecord){
                var form = parent.getForm();
                var values = form.getFieldValues();
                conc = values.concentration;
                dosage = values.dosage;
                conc_units = values.conc_units;
                id = values.Id;
            }
            else {
                conc = parent.boundRecord.get('concentration');
                dosage = this.getValue();
                id = parent.boundRecord.get('Id');
            }
            if(!conc || !dosage || !id){
                Ext.Msg.alert('Error', 'Must supply Id, dosage and concentration');
                return
            }

            if(parent.parentPanel.participantMap.get(id)){
                var weight = parent.parentPanel.participantMap.get(id)['Dataset/Demographics/weight'];

                if(this.msgDiv)
                    this.msgDiv.replaceWholeText('Weight: '+weight+' kg');
                else
                    this.msgDiv = this.container.insertHtml('beforeEnd', 'Weight: '+weight+' kg');

                var amount = EHR.UTILITIES.roundNumber(weight*dosage, 2);
                var vol = EHR.UTILITIES.roundNumber(weight*dosage/conc, 2);
                parent.boundRecord.set('amount', amount);
                parent.boundRecord.set('volume', vol);
                parent.boundRecord.set('dosage', dosage);
                parent.boundRecord.set('concentration', conc);
            }
            else {
                parent.parentPanel.participantMap.on('add', this.onTriggerClick, this, {single: true})
            }
        }
    }
});
Ext.reg('ehr-drugdosefield', EHR.ext.DrugDoseField);


