/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//This will contain custom ext components and ext overrides
Ext.namespace('EHR.ext');


LABKEY.requiresScript("/ehr/ext.ux.multiselect.js");
LABKEY.requiresScript("/ehr/datetime.js");



//the first section is more generic and might make sense to include in labkey

/**
 * The following overwrite allows tooltips on labels within form layouts.
 * The field have to have a property named "fieldLabelTip" in the corresponding
 * config object.
 */
Ext.override(Ext.layout.FormLayout, {
    fieldTpl: (function()
    {
        var t = new Ext.Template(
                '<div class="x-form-item {itemCls}" tabIndex="-1">',
                '<label for="{id}" style="{labelStyle}" class="x-form-item-label" {labelAttrs}>{label}{labelSeparator}</label>',
                '<div class="x-form-element" id="x-form-el-{id}" style="{elementStyle}" {fieldAttrs}>',
                '</div><div class="{clearCls}"></div>',
                '</div>'
                );
        t.disableFormats = true;
        return t.compile();
    })(),
    getTemplateArgs: function(field)
    {
        var noLabelSep = !field.fieldLabel || field.hideLabel;
        return {
            id            : field.id,
            label         : field.fieldLabel,
            labelAttrs    : field.fieldLabelTip ? 'ext:qtip="' + Ext.util.Format.htmlEncode(field.fieldLabelTip) + '"' : '',
            itemCls       : (field.itemCls || this.container.itemCls || '') + (field.hideLabel ? ' x-hide-label' : ''),
            clearCls      : field.clearCls || 'x-form-clear-left',
            labelStyle    : this.getLabelStyle(field.labelStyle),
            elementStyle  : this.elementStyle || '',
            fieldAttrs    : field.helpPopup ? 'ext:qtip="' + Ext.util.Format.htmlEncode(field.helpPopup) + '"' : '',
            labelSeparator: noLabelSep ? '' : (Ext.isDefined(field.labelSeparator) ? field.labelSeparator : this.labelSeparator)
        };
    }
});

//a css fix for Ext datepicker
Ext.menu.DateMenu.prototype.addClass('extContainer');


Ext.override(Ext.form.CheckboxGroup, {
    getNames: function()
    {
        var n = [];

        this.items.each(function(item)
        {
            if (item.getValue())
            {
                n.push(item.getName());
            }
        });

        return n;
    },

    getValues: function()
    {
        var v = [];
        this.items.each(function(item)
        {
            if (item.getValue())
            {
                v.push(item.getRawValue());
            }
        });

        return v;
    },

    getStringValue: function(delim)
    {
        delim = delim || ',';
        return this.getValues().join(delim);
    },

    setValues: function(v)
    {
        var r = new RegExp('(' + v.join('|') + ')');

        this.items.each(function(item)
        {
            item.setValue(r.test(item.getRawValue()));
        });
    }
});

Ext.override(Ext.form.RadioGroup, {
    getName: function()
    {
        return this.items.first().getName();
    },

    getValue: function()
    {
        var v;

        this.items.each(function(item)
        {
            v = item.getRawValue();
            return !item.getValue();
        });

        return v;
    },

    setValue: function(v)
    {
        this.items.each(function(item)
        {          
            item.setValue(item.getRawValue() == v);
        });
    }
});


EHR.ext.BooleanCombo = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function()
    {
        Ext.apply(this, {
            displayField: 'name',
            valueField: 'value',
            store: new Ext.data.ArrayStore({
                fields: ['name', 'value'],
                data: [
                    ['N/A',null],
                    ['No',false],
                    ['Yes',true]
                ]
            }),
            forceSelection:true,
            typeAhead: false,
            lazyInit: false,
            mode: 'local',
            triggerAction: 'all'

        });

        EHR.ext.BooleanCombo.superclass.initComponent.call(this, arguments);
    }
});
Ext.reg('ehr-booleancombo', EHR.ext.BooleanCombo);


EHR.ext.BooleanRadioGroup = Ext.extend(Ext.form.RadioGroup,
{
    initComponent: function()
    {
        Ext.applyIf(this, {
            id: this.name,
            items: [
                {boxLabel: 'N/A', name: this.name, inputValue: null, checked: true},
                {boxLabel: 'No', name: this.name, inputValue: 'false'},
                {boxLabel: 'Yes', name: this.name, inputValue: 'true'}
            ],
            columns: 1
        });

        EHR.ext.BooleanRadioGroup.superclass.initComponent.call(this, arguments);
    },
    setValue: function(v)
    {
        //NOTE: Ext doesnt seem to allow empty string as the inputValue, so we translate
        if (Ext.isDefined(v) && !Ext.isString(v)) {
            if(v===true)
                v = 'true';
            else if (v===false)
                v = 'false';
            else
                v = ''
        }
        this.items.each(function(item)
        {
            item.setValue(item.getRawValue() == v);
        });
    },
    getValue: function(){
        var v = EHR.ext.BooleanRadioGroup.superclass.getValue.call(this);
        if (Ext.isDefined(v) && Ext.isString(v)) {
            if(v.toLowerCase() == 'true')
                return true;
            if(v.toLowerCase() == 'false')
                return false;
            else
                return null;
        }
    }
});
//EHR.ext.BooleanRadioGroup = Ext.extend(Ext.form.RadioGroup, {
//    initComponent: function(){
//        Ext.applyIf(this, {
//            xtype: 'ehr-remoteradiogroup',
//            labelField: 'meaning',
//            valueField: 'value',
//            columns: 3,
//            store: new LABKEY.ext.Store({
//                schemaName: 'lookups',
//                queryName: 'yesno',
//                autoLoad: true
//            })
//        });
//
//        EHR.ext.BooleanRadioGroup.superclass.initComponent.call(this);
//    }
//});
Ext.reg('ehr-booleanradiogroup', EHR.ext.BooleanRadioGroup);


/* options:
valueField: the values of the radio
labelField: the label of the radio
value: the inital value of the radiogroup
 */
EHR.ext.RemoteRadioGroup = Ext.extend(Ext.form.RadioGroup,
{
    initComponent: function()
    {
        this.name = this.name || Ext.id();

        Ext.applyIf(this, {
            items: [{xtype: 'radio', hidden: true, name: this.name}]
        });

        EHR.ext.RemoteRadioGroup.superclass.initComponent.call(this, arguments);
    },

    onRender: function (ct, position) {
        EHR.ext.RemoteRadioGroup.superclass.onRender.call(this, ct, position);
        this.items = this.defaultItems || new Ext.util.MixedCollection();
        this.removeAll();

        if(this.store && !this.store.getCount())
            this.store.on('load', onStoreLoad, this);
        else
            onStoreLoad();

        function onStoreLoad() {
            var item;
            this.store.each(function(record, idx){
                item = {
                    xtype: 'radio',
                    boxLabel: record.get(this.labelField),
                    inputValue: record.get(this.valueField),
                    name: this.name,
                    checked: record.get(this.valueField)==this.value
                };

                var col = (idx+this.columns.length) % this.columns.length;
                var chk = this.panel.getComponent(col).add(item);
                this.items.add(item);
                this.fireEvent('add', this, chk);
            }, this);

            this.panel.doLayout();
            EHR.ext.RemoteRadioGroup.superclass.onRender.call(this, ct, position);
        }
    },
    removeAll: function () {
        for (var j = 0; j < this.columns; j++) {
            if (this.panel.getComponent(j).items.length > 0) {
                this.panel.getComponent(j).items.each(function (i) {
                    if (this.fireEvent('beforeremove', this, i) !== false) {
                        i.destroy();
                    }
                }, this);
            }
        }
    }

});
Ext.reg('ehr-remoteradiogroup', EHR.ext.RemoteRadioGroup);










//these component tend to be EHR specific

EHR.ext.ParticipantField = Ext.extend(Ext.form.TextField,
{
    initComponent: function()
    {
        Ext.apply(this, {
            labelAlign: 'top'
            ,fieldLabel: 'Id'
            ,allowBlank: false
            //,bubbleEvents: ['valid', 'invalid', 'added']
            ,validationDelay: 1000
            ,validationEvent: 'blur'
            ,validator: function(val, field)
            {
                if (!val)
                {
                    return 'This field is required';
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

                return species ? true : 'Invalid Id Format';

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
            ,width: 140
            ,name: this.name || 'Project'
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
            ,store: new Ext.data.Store()
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this, arguments);
        if (this.parentPanel)
        {
            this.mon(this.parentPanel, 'participantvalid', function(c)
            {
                this.getProjects(c.getValue());
            }, this);

            this.mon(this.parentPanel, 'participantinvalid', function(c)
            {
                this.store = new Ext.data.Store();
                this.setDisabled(true);
                this.setValue(null);
                this.emptyText = '';
            }, this);
        }
    },
    getProjects : function(id)
    {
        this.store = new EHR.ext.AdvancedStore({
            containerPath: 'WNPRC/EHR/',
            schemaName: 'study',
            queryName: 'assignment',
            viewName: 'Active Assignments',
            sort: '-project',
            tpl: '<tpl for="."><div class="x-combo-list-item">{' + this.displayField + '}</div></tpl>',
            filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
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
        });
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
            ,store: EHR.ext.getLookupStore({
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
    onRender: function(ct, position){
        EHR.ext.RemarkField.superclass.onRender.call(this, ct, position);
        console.log(this);
        var t = Ext.DomHelper.append(ct,
             {tag: 'a', html: '[Toggle Remark]'}
            , true);
        Ext.DomHelper.append(ct, {tag: 'div', html: '<br>'});

        t.on('click', function(t){
            this.container.setVisible(!this.container.isVisible());
        }, this);

    }
});
Ext.reg('ehr-remark', EHR.ext.RemarkField);

