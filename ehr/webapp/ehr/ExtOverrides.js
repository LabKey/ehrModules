/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

//This will contain ext overrides
Ext.namespace('EHR.ext');


/**
 * The following overwrite allows tooltips on labels within form layouts.
 * config object.
 */
//Ext.override(Ext.layout.FormLayout, {
//    fieldTpl: (function()
//    {
//        var t = new Ext.Template(
//                '<div class="x-form-item {itemCls}" tabIndex="-1">',
//                '<label for="{id}" style="{labelStyle}" class="x-form-item-label" {labelAttrs}>{label}{labelSeparator}{helpPopup}</label>',
//                '<div class="x-form-element" id="x-form-el-{id}" style="{elementStyle}" {fieldAttrs}>',
//                '</div><div class="{clearCls}"></div>',
//                '</div>'
//                );
//        t.disableFormats = true;
//        return t.compile();
//    })(),
//    getTemplateArgs: function(field)
//    {
//        var noLabelSep = !field.fieldLabel || field.hideLabel;
//        return {
//            id            : field.id,
//            label         : field.fieldLabel,
//            labelAttrs    : '',
//            helpPopup     : (field.helpPopup ? ' <a><span class="labkey-help-pop-up" ext:qtip="' + Ext.util.Format.htmlEncode(field.helpPopup) + '">?</span></a>' : ''),
//            itemCls       : (field.itemCls || this.container.itemCls || '') + (field.hideLabel ? ' x-hide-label' : ''),
//            clearCls      : field.clearCls || 'x-form-clear-left',
//            labelStyle    : this.getLabelStyle(field.labelStyle),
//            elementStyle  : this.elementStyle || '',
//            fieldAttrs    : field.qtip ? 'ext:qtip="' + Ext.util.Format.htmlEncode(field.qtip) + '"' : '',
//            labelSeparator: noLabelSep ? '' : (Ext.isDefined(field.labelSeparator) ? field.labelSeparator : this.labelSeparator)
//        };
//    }
//});
//Ext.override(Ext.layout.FormLayout,
//{
//    fieldTpl: (function()
//    {
//        var t = new Ext.Template(
//                '<div class="x-form-item {itemCls}" tabIndex="-1">',
//                '<label for="{id}" style="{labelStyle}" class="x-form-item-label" {labelAttrs}>{label}{labelSeparator}{helpPopup}</label>',
//                '<div class="x-form-element" id="x-form-el-{id}" style="{elementStyle}" {fieldAttrs}>',
//                '</div><div class="{clearCls}"></div>',
//                '</div>'
//                );
//        t.disableFormats = true;
//        return t.compile();
//    })(),
//
//    _origGetTemplateArgs : Ext.layout.FormLayout.prototype.getTemplateArgs,
//
//    _toQtip : function(o)
//    {
//        if(Ext.isString(o))
//            o = {html: o};
//
//        if (!o || !'html' in o || !o.html) return false;
//        var qtip = 'ext:qtip="' + o.html + '"';
//        if ('title' in o && o.title)
//            qtip += ' ext:qtitle="' + Ext.util.Format.htmlEncode(o.title) + '"';
//        return qtip;
//    },
//
//    getTemplateArgs: function(field)
//    {
//        var args = this._origGetTemplateArgs(field);
//        var noLabelSep = !field.fieldLabel || field.hideLabel;
//        var qtipPopup = this._toQtip(field.helpPopup);
//        var qtipField = this._toQtip(field.qtip || field.helpPopup);
//
//        return Ext.apply(args, {
//            labelAttrs    : '',
//            helpPopup     : (noLabelSep || !qtipPopup) ? '' : '<a href="#"><span class="labkey-help-pop-up" ' + qtipPopup + '>?</span></a>',
//            fieldAttrs    : '' // !qtipField ? '' : qtipField // doesn't work right (tip works over <div>, but not over <input>
//        });
//    }
//});


//a css fix for Ext datepicker and tabpanel
Ext.menu.DateMenu.prototype.addClass('extContainer');
Ext.TabPanel.prototype.addClass('extContainer');

LABKEY.ext.ComboPlugin.measureList = function (){
    if (!this.tm)
    {
        // XXX: should we share a TextMetrics instance across ComboBoxen using a hidden span?
        var el = this.combo.el ? this.combo.el : Ext.DomHelper.append(document.body, {tag:'span', style:{display:'none'}});
        this.tm = Ext.util.TextMetrics.createInstance(el);
    }

    var w = this.combo.el ? this.combo.el.getWidth(true) : 0;
    this.combo.store.each(function (r) {
        var html;
        if(this.combo.view && this.combo.view.tpl && this.combo.rendered)
        if (this.combo.view && this.combo.view.tpl && this.combo.rendered)
            html = this.combo.tpl.apply(r.data);
        else
            html = r.get(this.combo.displayField);
        w = Math.max(w, Math.ceil(this.tm.getWidth(html)));
    }, this);

    if (this.combo.list)
        w += this.combo.list.getFrameWidth('lr');

    // for vertical scrollbar
    w += 20;

    return w;
};


//Ext's 3.1 documentation says this should be the code.  the purpose is to allow null values in integers
Ext.data.Types.INT.convert = function(v){
    return v !== undefined && v !== null && v !== '' ?
        parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
}


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

