/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customFields', 'EHR.ext.customPanels');

LABKEY.requiresScript("/ehr/datetime.js");
//LABKEY.requiresScript("/ehr/arrayUtils.js");
LABKEY.requiresScript("/ehr/utilities.js");
LABKEY.requiresScript("/ehr/ehrEditorGridpanel.js");

Ext.form.Field.prototype.msgTarget = 'side';
Ext.menu.DateMenu.prototype.addClass('extContainer');

EHR.ext.standardMetadata = {
    Id: {lookups: false, inherited: true},
    Date: {inherited: true},
    created: {isHidden: true},
    AnimalVisit: {isHidden: true},
    modified: {isHidden: true},
    SequenceNum: {isHidden: true},
    QCState: {isHidden: true}
};

//Ext.form.Field.prototype.fieldTpl = new Ext.Template(
//    '<div class="x-form-item {itemCls}" tabIndex="-1">',
//        '<label for="{id}" style="{labelStyle}" class="x-form-item-label">{label}{labelSeparator}</label>',
//        '<div for="{id}" >abc</div>',
//        '<div class="x-form-element" id="x-form-el-{id}" style="{elementStyle}">',
//        '</div><div class="{clearCls}"></div>',
//    '</div>'
//);
//
//Ext.FormPanel.prototype.fieldTpl = new Ext.Template(
//    '<div class="x-form-item {itemCls}" tabIndex="-1">',
//        '<label for="{id}" style="{labelStyle}" class="x-form-item-label">{label}{labelSeparator}</label>',
//        '<div>abc</div>',
//        '<div class="x-form-element" id="x-form-el-{id}" style="{elementStyle}">',
//        '</div><div class="{clearCls}"></div>',
//    '</div>'
//);

EHR.ext.formPanel = Ext.extend(Ext.Panel, {
    constructor: function(config){
        config = config || {};

        Ext.QuickTips.init();
        
        Ext.applyIf(this, {
            autoHeight: true
            ,bodyBorder: true
            ,border: true
            ,buttonAlign: 'left'
            ,frame:true
            ,defaultType: 'textfield'
            ,bodyStyle: 'padding:5px 5px 5px 5px'
            ,monitorValid: true
            ,defaults: {
                msgTarget: 'side'
                ,validationDelay: 1000
                ,bubbleEvents: ['valid', 'invalid', 'add']
            }
            ,buttons: [
                {text: 'Save Draft', id: 'saveDraft', handler: this.onSubmit, scope: this},
                {text: 'Submit', id: 'submit', handler: this.onSubmit, scope: this, formBind: true},
                {text: 'Submit for SNOMED Coding', id: 'snomedReview', handler: this.onSubmit, scope: this, formBind: true},
                {text: 'Discard', id: 'discard', handler: this.discard, scope: this}
            ]
            ,uuid: LABKEY.ActionURL.getParameter('uuid') // || LABKEY.Utils.generateUUID()
        });

        EHR.ext.formPanel.superclass.constructor.call(this, config);

        window.onbeforeunload = LABKEY.beforeunload(function () {
            if (this.getForm().isDirty())
                return this.warningMessage;
        }, this);
    },
    onSubmit: function(o){
        console.log(o)
    },
    discard: function(o){
        console.log(o)
    }
});







EHR.ext.Header = Ext.extend(Ext.form.FieldSet, {
    initComponent: function(){
        Ext.apply(this, {
            autoHeight: true
            ,id: 'header'
            ,title: 'Header'
//            ,width: 'auto'
            ,layout: 'column'
            ,bodyBorder: true
            ,labelAlign: 'top'
            ,border: true
//            ,bodyStyle: 'padding:5px 5px 5px 5px'
            ,bubbleEvents: ['valid', 'invalid', 'add']
            ,defaults: {
                width: 'auto',
                fieldGroup: 'parent',
                border: true,
                bubbleEvents: ['valid', 'invalid', 'add']
            }
            ,items: [
                {
                    columnWidth:'250px',
                    style:'padding-right:4px;padding-top:1px',
                    layout: 'form',
                    items: [{
                        xtype:'ehr-animal',
                        id: 'id',
                        listeners: {
                            scope: this,
                            valid: this.fetchAbstract
                        }
                    }]
                },{
                    columnWidth:'300px',
                    layout: 'form',
                    items: [{
                        xtype:'xdatetime',
                        id: 'datetime',
                        fieldLabel: 'Date/Time',
                        dateFormat: 'Y-m-d',
                        timeFormat: 'H:i'
                    }]
                },{
                    columnWidth:'150px',
                    style:'padding-left:4px;padding-top:1px',
                    layout: 'form',
                    items: [{
                        xtype:'ehr-project',
                        id: 'project'
                    }]
                }]
        });
        EHR.ext.Header.superclass.initComponent.call(this);
    },
    fetchAbstract: function(c){
        var id = c.getValue();
        if (!id)
            return false;

        var target = this.ownerCt.find('id', 'abstract');
        target = target[0];
        target.removeAll();

        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'animal',
            viewName: 'Clinical Summary',
            containerPath: 'WNPRC/EHR/',
            filterArray: [LABKEY.Filter.create('Id', id, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            successCallback: this.renderAbstract
        });
    },
    renderAbstract: function(data){
        var target = this.ownerCt.find('id', 'abstract');
        target = target[0];
        target.removeAll();

        if(!data.rows.length){
            target.add({xtype: 'displayfield', value: 'Id Not Found'});
        }
        else {
            var row = data.rows[0];
            Ext.each(data.metaData.fields, function(c){
                if(c.isHidden)
                    return false;
                var value = row['_labkeyurl_'+c.name] ? '<a href="'+row['_labkeyurl_'+c.name]+'" target=new>'+row[c.name]+'</a>' : row[c.name];
                target.add({xtype: 'displayfield', fieldLabel: c.caption, value: value});
            }, this);
        }
        target.doLayout();
        target.expand();
    }
});
Ext.reg('ehr-header', EHR.ext.Header);


EHR.ext.Abstract = Ext.extend(Ext.form.FieldSet,
{
    initComponent: function(){
        Ext.apply(this, {
            autoHeight: true
            ,title: 'Abstract'
            ,collapsible: true
            ,collapsed: true
            ,width: 'auto'
            ,id: 'abstract'
            ,defaultType: 'displayfield'
            ,bubbleEvents: ['valid', 'invalid', 'add']
            ,border: true
        });
        EHR.ext.Abstract.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-abstract', EHR.ext.Abstract);


EHR.ext.DateTimeField = Ext.extend(Ext.form.Field,
{
    initComponent: function(){
        Ext.apply(this, {
            autoHeight: true
            ,bodyBorder: false
            ,labelAlign: 'top'
            ,border: false
            ,xtype: 'datetimefield'
            ,cls:'extContainer'
            ,fieldLabel: 'Date'
            ,name: 'date'
        });

        EHR.ext.DateTimeField.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-datetime', EHR.ext.DateTimeField);

//this vtype is used for WNPRC animal ids
Ext.apply(Ext.form.VTypes, {
    'ehr-animal' : function(val, field)
    {
        if (!val)
        {
            return;
        }

        var species;
        if (val.match(/(^rh([0-9]{4}))|(^r([0-9]{5}))/))
            species = 'Rhesus';
        else if (val.match(/^cy([0-9]{4})/))
            species = 'Cynomolgus';
        else if (val.match(/^ag([0-9]{4})/))
            species = 'Vervet';
        else if (val.match(/^cj([0-9]{4})/))
            species = 'Marmoset';
        else if (val.match(/^so([0-9]{4})/))
            species = 'Cotton-top Tamarin';
        else if (val.match(/^pt([0-9]{4})/))
            species = 'Pigtail';

        return species ? true : false;

    },
    'ehr-animalText': 'Invalid Id Format'
});


EHR.ext.AnimalField = Ext.extend(Ext.form.TextField,
{
    initComponent: function(){
        Ext.apply(this, {
            labelAlign: 'top'
            ,vtype: 'ehr-animal'
            ,fieldLabel: 'Id'
            ,required: true
            ,bubbleEvents: ['valid', 'invalid', 'added']
            ,validationDelay: 1000
            ,validationEvent: 'blur'
        });

        EHR.ext.AnimalField.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-animal', EHR.ext.AnimalField);


EHR.ext.ProjectField = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function(){
        Ext.apply(this, {
            fieldLabel: 'Project'
            ,width: 120
            ,name: 'Project'
            ,emptyText:'Select project...'
            ,displayField:'project'
            ,valueField: 'project'
            ,typeAhead: true
            ,mode: 'local'
            ,store: EHR.ext.getLookupStore({
                containerPath: 'WNPRC/EHR/',
                schemaName: 'lists',
                queryName: 'project',
                sort: 'project'
            })
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-project', EHR.ext.ProjectField);


EHR.ext.ProtocolField = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function(){
        Ext.apply(this, {
            fieldLabel: 'Protocol'
            ,name: 'Protocol'
            ,emptyText:'Select protocol...'
            ,displayField:'protocol'
            ,valueField: 'protocol'
            ,typeAhead: true
            ,mode: 'local'
            ,store: EHR.ext.getLookupStore({
                containerPath: 'WNPRC/EHR/',
                schemaName: 'lists',
                queryName: 'protocol',
                sort: 'protocol'
            })
        });

        EHR.ext.ProjectField.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-protocol', EHR.ext.ProtocolField);


EHR.ext.BooleanCombo = Ext.extend(LABKEY.ext.ComboBox,
{
    initComponent: function(){
        Ext.apply(this, {
            displayField: 'name',
            valueField: 'value',
            store: new Ext.data.ArrayStore({
                fields: ['name', 'value'],
                data: [['N/A',''], ['No',false], ['Yes',true]]
            }),
            forceSelection:true,
            typeAhead: false,
            lazyInit: false,
            mode: 'local',
            triggerAction: 'all'

        });

        EHR.ext.BooleanCombo.superclass.initComponent.call(this);
    }
});
Ext.reg('ehr-booleancombo', EHR.ext.BooleanCombo);


EHR.ext.getLookupStore = function(c, uniqueName)
{
    // normalize lookup
    c.table = c.table || c.queryName;
    c.schema = c.schema || c.schemaName;
    c.view = c.view || c.viewName;
    c.container = c.container || c.containerPath || LABKEY.container.path;

    if (typeof(uniqueName) != 'string')
        uniqueName = [c.container,c.schema,c.table,c.view,c.keyColumn,c.displayColumn].join('||');

    var store = Ext.StoreMgr.key(uniqueName);
    if (!store)
    {
        var columns = [];
        if (c.keyColumn)
            columns.push(c.keyColumn);

        if (c.displayColumn && c.displayColumn != c.keyColumn)
            columns.push(c.displayColumn);

        if(columns.length)
            c.columns = columns.join(',');

        c.autoLoad = true;
        c.storeId = uniqueName;

        store = new LABKEY.ext.Store(c);
    }
    return store;
}


//EHR.ext.DateField = Ext.extend(LABKEY.ext.DateField,
//{
//    initComponent: function(){
//        Ext.applyIf(this, {
//            listeners:{
//                      blur:{scope:this, fn:this.onBlur}
//                     ,focus:{scope:this, fn:this.onFocus}
//            }
//        });
//
//        EHR.ext.DateField.superclass.initComponent.apply(this, arguments);
//    },
//    onBlur:function(f) {
//        // called by both DateField and TimeField blur events
//
//        // revert focus to previous field if clicked in between
//        if(this.wrapClick) {
//                f.focus();
//                this.wrapClick = false;
//        }
//
//        // fire events later
//        (function() {
//                if(!this.hasFocus) {
//                        var v = this.getValue();
//                        if(String(v) !== String(this.startValue)) {
//                                this.fireEvent("change", this, v, this.startValue);
//                        }
//                        this.hasFocus = false;
//                        this.fireEvent('blur', this);
//                }
//        }).defer(100, this);
//
//    } // eo function onBlur
//});
//Ext.reg('ehr-date', EHR.ext.DateField);


EHR.ext.QuerySet = Ext.extend(Ext.form.FieldSet,
{
    initComponent: function(){
        Ext.apply(this, {
            autoHeight: true
            ,collapsible: true
            ,width: 'auto'
            ,border: true
            ,items: {xtype: 'displayfield', value: 'Loading...'}
        });

        LABKEY.Query.getQueryDetails({
            queryName: this.queryName
            ,schemaName: this.schemaName
            ,successCallback: this.loadQuery
            ,errorCallback: EHR.UTILITIES.onError
            ,scope: this
        });
        EHR.ext.QuerySet.superclass.initComponent.apply(this, arguments);

    },
    loadQuery: function(meta){
        this.removeAll();
        Ext.each(meta.columns, function(c){
            //TODO: get shownInInsertView applied correctly
            if(this.metadata && this.metadata[c.name])
                EHR.UTILITIES.rApply(c, this.metadata[c.name]);

            EHR.UTILITIES.rApply(c, {fieldLabel: c.label, queryName: this.queryName, schemaName: this.schemaName});
            
            if (!c.isHidden && c.shownInInsertView){
                if (c.inputType == 'textarea')
                    EHR.UTILITIES.rApply(c, {ext: {height: 100, width: 400}});
                else
                    EHR.UTILITIES.rApply(c, {ext: {width: 200}});

                if (c.inherited){
                    EHR.UTILITIES.rApply(c, {ext: {xtype: 'hidden'}});
                    //TODO: point to header
                }

                this.add(LABKEY.ext.FormHelper.getFieldEditor(c));
            }
        }, this);
        this.doLayout();
    }

});
Ext.reg('ehr-queryset', EHR.ext.QuerySet);




/**
 * @author Andrew Pleshkov
 */
//http://www.sencha.com/forum/showthread.php?98292-DateTime-field-again-and-again-%29&highlight=time+picker
//new Ext.ux.form.DateTimeField({
//    fieldLabel: 'date & time',
//    dateFormat: 'd.m.Y',
//    timeFormat: 'H:i'
//});
Ext.namespace('Ext.ux.form');

(function () {

    var Form = Ext.ux.form;

    //

    function doSomeAlchemy(picker) {
        Ext.apply(picker, {

            _getDateTime: function (value) {
                if (this.timeField != null) {
                    var timeval = this.timeField.getValue();
                    value = Date.parseDate(value.format(this.dateFormat) + ' ' + timeval, this.format);
                }
                return value;
            },

            _initTimeField: function () {
                if (null == this.timeField) {
                    var config = Ext.apply({}, this.timeFieldConfig, {
                        width: 100
                    });
                    var timeField = this.timeField = Ext.ComponentMgr.create(config, 'timefield');

                    if (timeField instanceof Ext.form.ComboBox) {
                        timeField.getListParent = function () {
                            return this.el.up('.x-menu');
                        }.createDelegate(timeField);

                        if (Ext.isIE7) {
                            timeField.maxHeight = 190;
                        }
                    }
                }
            },

            setValue: function (value) {
                if (null == this.timeField) {
                    this._initTimeField();
                    this.timeField.setValue(value);
                }

                this.value = this._getDateTime(value);
                this.update(this.value, true);
            },

            update: function (date, forceRefresh) {
                var d = date.clone().clearTime();
                Ext.DatePicker.prototype.update.call(this, d, forceRefresh);
            },

            _handleTimeButtonClick: function (e) {
                e.stopEvent();
                var t = this.el.child('table.x-date-inner td.x-date-selected a', true);
                this.handleDateClick(e, t);
            },

            onRender: function () {
                Ext.DatePicker.prototype.onRender.apply(this, arguments);

                var cls = 'ux-form-datetimefield';
                var timeBtnCls = cls + '-timeButton';

                var table = this.el.child('table');

                Ext.DomHelper.insertBefore(table.child('tr:first'), {
                    tag: 'tr',
                    children: [
                        {
                            tag: 'td',
                            colspan: '3',
                            cls: 'x-date-bottom',
                            style: 'border-top: 0',
                            children: [
                                {
                                    tag: 'table',
                                    cellspacing: 0,
                                    cls: 'x-date-picker',
                                    style: 'background: transparent',
                                    children: [
                                        {
                                            tag: 'tbody',
                                            children: [
                                                {
                                                    tag: 'tr',
                                                    children: [
                                                        {
                                                            tag: 'td',
                                                            style: 'padding-right: 5px',
                                                            html: this.timeFieldLabel
                                                        },
                                                        {
                                                            tag: 'td',
                                                            cls: cls
                                                        },
                                                        {
                                                            tag: 'td',
                                                            cls: 'x-date-right',
                                                            style: 'text-align: left; background: transparent; padding-left: 5px',
                                                            html: '<a class="' + timeBtnCls + '" href="#"> </a>'
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }, true);

                var selBtn = table.child('a.' + timeBtnCls);
                selBtn.on('click', this._handleTimeButtonClick, this);

                var ct = table.child('td.' + cls);
                this.timeField.render(ct);
            },

            beforeDestroy: function () {
                if (this.timeField) {
                    Ext.destroy(this.timeField);
                    delete this.timeField;
                }

                Ext.DatePicker.prototype.beforeDestroy.call(this);
            },

            fixIE: function () {
                var el = this.timeField.el;
                el.repaint();
            }

        });
    }

    //

    var DateMenu = Ext.extend(Ext.menu.DateMenu, {

        initComponent: function () {
            DateMenu.superclass.initComponent.call(this);

            if (Ext.isStrict && Ext.isIE7) {
                this.on('show', function () {
                    var h = this.picker.el.getComputedHeight();
                    h += this.el.getFrameWidth('tb');
                    this.setHeight(h);
                }, this, { single: true });
            }

            // Using of Ext.DatePicker as this.picker is hardcoded in Ext.menu.DateMenu,
            // so we need to do some alchemy to provide additional functionality and avoid copypasta
            doSomeAlchemy(this.picker);
        },

        onShow: function () {
            DateMenu.superclass.onShow.apply(this, arguments);

            this.picker.fixIE();
        }

    });

    //

    Form.DateTimeField = Ext.extend(Ext.form.DateField, {

        defaultAutoCreate : {
            tag: "input",
            type: "text",
            size: "20",
            autocomplete: "off"
        },

        timeFieldLabel: 'Time',

        initComponent: function () {
            var tfc = this.timeFieldConfig || {};

            if (this.timeFormat != null && tfc.format != null) {
                throw 'What time format do you prefer?';
            }
            var timeFormat = this.timeFormat || tfc.format || Ext.form.TimeField.prototype.format;
            this.timeFormat = tfc.format = timeFormat;

            this.timeFieldConfig = tfc;

            this.dateFormat = this.dateFormat || Ext.form.DateField.prototype.format;
            this.format = this.dateFormat + ' ' + this.timeFormat;

            Form.DateTimeField.superclass.initComponent.call(this);
        },

        onTriggerClick: function () {
            if (null == this.menu) {
                this.menu = new DateMenu({
                    hideOnClick: false,
                    focusOnSelect: false,
                    //
                    timeFieldLabel: this.timeFieldLabel,
                    timeFieldConfig: this.timeFieldConfig,
                    dateFormat: this.dateFormat,
                    format: this.format
                });
            }

            Form.DateTimeField.superclass.onTriggerClick.call(this);
        }

    });

    Ext.reg('datetimefield', Form.DateTimeField);

})();



