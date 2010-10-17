/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.namespace('EHR.ext.customFields', 'EHR.ext.customPanels', 'EHR.UTILITIES');

LABKEY.requiresScript("/ehr/arrayUtils.js");



//this is a generic class for a combobox populated from a labkey store
EHR.ext.customFields.LabKeyCombo = Ext.extend(Ext.form.ComboBox,
{
    constructor : function(config)
    {
        config = config || {};
        var defaults = {
            valueField:'Key'
            ,typeAhead: false
            ,mode: 'local'
            ,width: 165
            ,triggerAction: 'all'
            ,forceSelection: true
            ,editable: false
            ,lazyRender: false
            ,lazyInit: false
            ,autoLoad: true
        };
        if (!config.store)
        {
            config.emptyText = 'Error: You Must Specify a Store'
        }
        else
        {
            config.store.load()
        }
        ;

        Ext.applyIf(config, defaults);

        //Ext.form.ComboBox.prototype.constructor(config);
        EHR.ext.customFields.LabKeyCombo.superclass.constructor.call(this, config);

        if (this.store && this.value && this.displayField && this.valueField && this.displayField != this.valueField)
        {
            this.initialValue = this.value;
            if (this.store.getCount())
                this.initialLoad();
            else
            {
                this.store.on('load', this.initialLoad, this);
                if (!this.store.proxy.activeRequest)
                    this.store.load();
            }
        }

    },

    initialLoad : function()
    {
        this.store.un('load', this.initialLoad, this);
        if (this.value === this.initialValue)
        {
            var v = this.value;
            this.setValue(v);
        }
    }
});
Ext.reg('LabKeyCombo', EHR.ext.customFields.LabKeyCombo);




//this is a generic class for a combobox populated from a labkey store
EHR.ext.customFields.DateRangePanel = Ext.extend(Ext.Panel,
{
    initComponent : function(config)
    {
        var defaults = {
            //cls: 'extContainer',
            bodyBorder: false,
            border: false,
            defaults: {
                border: false,
                bodyBorder: false
            }
        };

        Ext.applyIf(defaults, config);
        
        Ext.apply(this, defaults);

        EHR.ext.customFields.DateRangePanel.superclass.initComponent.call(this);

        this.startDateField = new LABKEY.ext.DateField({
            format: 'Y-M-d' //YYYY-MMM-DD
            ,width: 165
            ,name:'startDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,scope: this
            ,value: LABKEY.ActionURL.getParameter('startDate')
        });

        this.endDateField = new LABKEY.ext.DateField({
            format: 'Y-M-d' //YYYY-MMM-DD
            ,width:165
            ,name:'endDate'
            ,allowBlank:true
            ,vtype: 'daterange'
            ,scope: this
            ,value: LABKEY.ActionURL.getParameter('endDate')
        });

        Ext.apply(this.endDateField, {startDateField: this.startDateField});
        Ext.apply(this.startDateField, {endDateField: this.endDateField});

        this.add({tag: 'div', html: 'From:'});
        this.add(this.startDateField);
        this.add({tag: 'div', html: 'To:'});
        this.add(this.endDateField);
        this.add({tag: 'div', html: '<br>'});

    }

});
Ext.reg('DateRangePanel', EHR.ext.customFields.DateRangePanel);


//this is a class for a combobox containing operators as might be used in a search form
EHR.ext.customFields.OperatorCombo = Ext.extend(Ext.form.ComboBox,
{
    constructor : function(config)
    {
        config = config || {};
        var defaults = {
            valueField:'value'
            ,typeAhead: false
            ,mode: 'local'
            ,width: 165
            ,triggerAction: 'all'
            ,editable: false
            ,lazyRender: false
            ,lazyInit: false
            ,displayField:'displayText'
            ,hiddenName:'operator'
            ,value: 'startswith'
            ,items: [

                ]
            ,store: new Ext.data.SimpleStore({
                fields: [
                    'value',
                    'displayText'
                ],
                data: [
                    ['startswith', 'Starts With'],
                    ['eq', 'Equals'],
                    ['neqornull', 'Does Not Equal'],
                    ['isblank', 'Is Blank'],
                    ['isnonblank', 'Is Not Blank'],
                    ['gt', 'Is Greater Than'],
                    ['lt', 'Is Less Than'],
                    ['gte', 'Is Greater Than or Equal To'],
                    ['lte', 'Is Less Than or Equal To'],                        
                    ['contains', 'Contains'],
                    ['doesnotcontains', 'Does Not Contain'],                    
                    ['doesnotstartswith', 'Does Not Start With'],
                    ['in', 'Equals One Of (e.g. \'a;b;c\')']
                ]
            })
        };

        Ext.applyIf(config, defaults);

        EHR.ext.customFields.OperatorCombo.superclass.constructor.call(this, config);

        if (this.store && this.value && this.displayField && this.valueField && this.displayField != this.valueField)
        {
            this.initialValue = this.value;
            if (this.store.getCount())
                this.initialLoad();
            else
            {
                this.store.on('load', this.initialLoad, this);
                if (!this.store.proxy.activeRequest)
                    this.store.load();
            }
        }

    },

    initialLoad : function()
    {
        this.store.un('load', this.initialLoad, this);
        if (this.value === this.initialValue)
        {
            var v = this.value;
            this.setValue(v);
        }
    }
});
Ext.reg('OperatorCombo', EHR.ext.customFields.OperatorCombo);



//this is a class for a combobox containing operators as might be used in a search form
EHR.ext.customFields.OperatorComboDate = Ext.extend(Ext.form.ComboBox,
{
    constructor : function(config)
    {
        config = config || {};
        var defaults = {
            valueField:'value'
            ,typeAhead: false
            ,mode: 'local'
            ,width: 165
            ,triggerAction: 'all'
            ,editable: false
            ,lazyRender: false
            ,lazyInit: false
            ,displayField:'displayText'
            ,hiddenName:'operator'
            ,value: 'eq'
            ,items: [

                ]
            ,store: new Ext.data.SimpleStore({
                fields: [
                    'value',
                    'displayText'
                ],
                data: [
                    ['eq', 'Equals'],
                    ['neqornull', 'Does Not Equal'],
                    ['isblank', 'Is Blank'],
                    ['isnonblank', 'Is Not Blank'],
                    ['gt', 'Is Greater Than'],
                    ['lt', 'Is Less Than'],
                    ['gte', 'Is Greater Than or Equal To'],
                    ['lte', 'Is Less Than or Equal To']
                ]
            })
        };

        Ext.applyIf(config, defaults);

        EHR.ext.customFields.OperatorCombo.superclass.constructor.call(this, config);

        if (this.store && this.value && this.displayField && this.valueField && this.displayField != this.valueField)
        {
            this.initialValue = this.value;
            if (this.store.getCount())
                this.initialLoad();
            else
            {
                this.store.on('load', this.initialLoad, this);
                if (!this.store.proxy.activeRequest)
                    this.store.load();
            }
        }

    },

    initialLoad : function()
    {
        this.store.un('load', this.initialLoad, this);
        if (this.value === this.initialValue)
        {
            var v = this.value;
            this.setValue(v);
        }
    }
});
Ext.reg('OperatorComboDate', EHR.ext.customFields.OperatorComboDate);


//this is a class for a combobox containing operators as might be used in a search form
EHR.ext.customFields.OperatorComboNum = Ext.extend(Ext.form.ComboBox,
{
    constructor : function(config)
    {
        config = config || {};
        var defaults = {
            valueField:'value'
            ,typeAhead: false
            ,mode: 'local'
            ,width: 165
            ,triggerAction: 'all'
            ,editable: false
            ,lazyRender: false
            ,lazyInit: false
            ,displayField:'displayText'
            ,hiddenName:'operator'
            ,value: 'eq'
            ,items: [

                ]
            ,store: new Ext.data.SimpleStore({
                fields: [
                    'value',
                    'displayText'
                ],
                data: [
                    ['eq', 'Equals'],
                    ['neqornull', 'Does Not Equal'],
                    ['isblank', 'Is Blank'],
                    ['isnonblank', 'Is Not Blank'],
                    ['gt', 'Is Greater Than'],
                    ['lt', 'Is Less Than'],
                    ['gte', 'Is Greater Than or Equal To'],
                    ['lte', 'Is Less Than or Equal To'],
                    ['in', 'Equals One Of (e.g. \'a;b;c\')']
                ]
            })
        };

        Ext.applyIf(config, defaults);

        EHR.ext.customFields.OperatorCombo.superclass.constructor.call(this, config);

        if (this.store && this.value && this.displayField && this.valueField && this.displayField != this.valueField)
        {
            this.initialValue = this.value;
            if (this.store.getCount())
                this.initialLoad();
            else
            {
                this.store.on('load', this.initialLoad, this);
                if (!this.store.proxy.activeRequest)
                    this.store.load();
            }
        }

    },

    initialLoad : function()
    {
        this.store.un('load', this.initialLoad, this);
        if (this.value === this.initialValue)
        {
            var v = this.value;
            this.setValue(v);
        }
    }
});
Ext.reg('OperatorComboNum', EHR.ext.customFields.OperatorComboNum);


EHR.UTILITIES.Header = function(title){
    var header = document.createElement('span');
    header.innerHTML = '<table class="labkey-wp"><tbody><tr class="labkey-wp-header"><th class="labkey-wp-title-left">' +
    (title || 'Details:')+ '</th><th class="labkey-wp-title-right">&nbsp;</th></tr></tbody></table><p/>';

    return header;
}

//function to test whether a user is a member of the allowed group array
EHR.UTILITIES.isMemberOf = function(allowed, successCallback){
    if (typeof(allowed) != 'object')
        allowed = [allowed];

    LABKEY.Security.getGroupsForCurrentUser({
        successCallback: function (results){
            for(var i=0;i<results.groups.length;i++){
                if (allowed.contains(results.groups[i].name)){
                    successCallback();
                    return true;
                }
            }
        }
    });
};


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
            (function(){start.validate()}).defer(10);
            this.dateRangeMax = date;

            start.fireEvent('change', start);
        }
        else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime())))
        {
            //var end = Ext.getCmp(field.endDateField);
            var end = field.endDateField;
            end.setMinValue(date);
            (function(){end.validate()}).defer(10);
            this.dateRangeMin = date;

            end.fireEvent('change', end);
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */


        return true;
    }
});




//generic error handler
EHR.UTILITIES.onError = function(error){
    console.log('ERROR: ' + error.exception);
    console.log(error);
    
    /*
    LABKEY.Query.insertRows({
         containerPath: '/shared',
         schemaName: 'lists',
         queryName: 'errors',
         rowDataArray: [
            {UserID:  LABKEY.Security.currentUser,
            Page: window.location
            Timestamp: new Date(),
            Error: error.exception,
            }]
    */
};

EHR.UTILITIES.rApplyIf = function(o, c){
    if(o){
        for(var p in c){
            if(!Ext.isDefined(o[p])){
                o[p] = c[p];
            }
            else if(Ext.type(o[p])=='object'){
                EHR.UTILITIES.rApplyIf(o[p], c[p]);
            }
        }
    }
    return o;
}


EHR.UTILITIES.rApply = function(o, c){
    if(o){
        for(var p in c){
            if(Ext.type(o[p])=='object'){
                EHR.UTILITIES.rApply(o[p], c[p]);
            }
            else {
                o[p] = c[p];
            }
        }
    }
    return o;
}


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
        c.noValidationCheck = true;
        store = new LABKEY.ext.Store(c);
    }
    return store;
}


Ext.namespace('Ext.ux');
/**
 * @class Ext.ux.FitToParent
 * @extends Object
 * <p>Plugin for {@link Ext.BoxComponent BoxComponent} and descendants that adjusts the size of the component to fit inside a parent element</p>
 * <p>The following example will adjust the size of the panel to fit inside the element with id="some-el":<pre><code>
var panel = new Ext.Panel({
    title: 'Test',
    renderTo: 'some-el',
    plugins: ['fittoparent']
});</code></pre></p>
 * <p>It is also possible to specify additional parameters:<pre><code>
var panel = new Ext.Panel({
    title: 'Test',
    renderTo: 'other-el',
    autoHeight: true,
    plugins: [
        new Ext.ux.FitToParent({
            parent: 'parent-el',
            fitHeight: false,
            offsets: [10, 0]
        })
    ]
});</code></pre></p>
 * <p>The element the component is rendered to needs to have <tt>style="overflow:hidden"</tt>, otherwise the component will only grow to fit the parent element, but it will never shrink.</p>
 * <p>Note: This plugin should not be used when the parent element is the document body. In this case you should use a {@link Ext.Viewport Viewport} container.</p>
 */
Ext.ux.FitToParent = Ext.extend(Object, {
    /**
     * @cfg {HTMLElement/Ext.Element/String} parent The element to fit the component size to (defaults to the element the component is rendered to).
     */
    /**
     * @cfg {Boolean} fitWidth If the plugin should fit the width of the component to the parent element (default <tt>true</tt>).
     */
    fitWidth: true,
    /**
     * @cfg {Boolean} fitHeight If the plugin should fit the height of the component to the parent element (default <tt>true</tt>).
     */
    fitHeight: true,
    /**
     * @cfg {Boolean} offsets Decreases the final size with [width, height] (default <tt>[0, 0]</tt>).
     */
    offsets: [0, 0],
    /**
     * @constructor
     * @param {HTMLElement/Ext.Element/String/Object} config The parent element or configuration options.
     * @ptype fittoparent
     */
    constructor: function(config) {
        config = config || {};
        if(config.tagName || config.dom || Ext.isString(config)){
            config = {parent: config};
        }
        Ext.apply(this, config);
    },
    init: function(c) {
        this.component = c;
        c.on('render', function(c) {
            this.parent = Ext.get(this.parent || c.getPositionEl().dom.parentNode);
            if(c.doLayout){
                c.monitorResize = true;
                c.doLayout = c.doLayout.createInterceptor(this.fitSize, this);
            } else {
                this.fitSize();
                Ext.EventManager.onWindowResize(this.fitSize, this);
            }
        }, this, {single: true});
    },
    fitSize: function() {
        var pos = this.component.getPosition(true),
            size = this.parent.getViewSize();
        this.component.setSize(
            this.fitWidth ? size.width - pos[0] - this.offsets[0] : undefined,
            this.fitHeight ? size.height - pos[1] - this.offsets[1] : undefined);
    }
});
Ext.preg('fittoparent', Ext.ux.FitToParent);