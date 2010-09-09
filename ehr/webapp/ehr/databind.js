/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
//function createOverrides()  {
//http://www.sencha.com/forum/showthread.php?83770-Ext-Databinding&highlight=Ext-Databinding

// Override on fieldsets
//Ext.form.FieldSet.prototype.onCheckClick = Ext.form.FieldSet.prototype.onCheckClick.createSequence(function() {
//  this.onCheckFire = true;
//  this.fireEvent('change', this, !this.checkbox.dom.checked, this.checkbox.dom.checked);
//});
//
//Ext.override(Ext.form.FieldSet, {
//  getCheckbox : function()  {
//    return this.checkbox;
//  },
//
//  parseBoolean : function(value){
//    if (Ext.isDefined(value) && Ext.isString(value)) {
//      return (value.toLowerCase() == 'true' ? true:false);
//    }
//    return value;
//  },
//
//  getValue : function() {
//    return this.getCheckbox().dom.checked;
//  },
//
//  setValue : function(value) {
//    if (!this.onCheckFire)  {
//      this.getCheckbox().dom.checked = this.parseBoolean(value);
//      this.onCheckClick();
//      this.onCheckFire = false;
//    }
//  }
//})


// Override on HtmlEditor
//Ext.form.HtmlEditor.prototype.initComponent = Ext.form.HtmlEditor.prototype.initComponent.createSequence(function() {
//  this.addEvents('change');
//  this.on('initialize', function(editor)  {
//    if(document.all) {
//      editor.iframe.attachEvent("onblur", this.onEditorBlur.createDelegate(this));
//    }
//    else {
//      editor.iframe.contentDocument.addEventListener("blur",this.onEditorBlur.createDelegate(this), false);
//    }
//  })
//  this.on('sync', function(editor, html)  {
//    this.value = html;
//  })
//});
//
//Ext.form.HtmlEditor.prototype.setValue = Ext.form.HtmlEditor.prototype.setValue.createSequence(function(value) {
//  this.oldValue = value;
//});
//
//Ext.override(Ext.form.HtmlEditor, {
//  oldVal : null,
//  value  : null,
//  onEditorBlur: function()  {
//    this.fireEvent('change', this, this.oldVal, this.value);
//  }
//})
//}

// Apply databinding to items in the panel.
// This should also consider binding to child containers as well.
//Ext.Panel.prototype.initComponent = Ext.Panel.prototype.initComponent.createSequence(function() {
////  createOverrides();
//  if (this.store)  {
//    this.store = Ext.StoreMgr.lookup(this.store);
//    this.store.on({
//      scope: this,
//      load : function(store, records, options ) {
//        // Can only contain one row of data.
//        if (records.length > 0) {
//          this.onBind(records[0]);
//        } else  {
//          store.addRecord(new store.recordType());
//          this.onBind(records[0]);
//          //this.onUnbind();
//        }
//      }
//    });
//
//    // Make sure that edits return to the datastore through fields onChange event.
//    this.on({
//      scope: this,
//      afterRender: function() {
//        this.walkChildren(this, function(f)  {
//            console.log(f.name)
//          f.on({
//            scope: this,
//            change: function(field) {
//              console.log('change called')
//              if(this.boundRecord) {
//                var val = (field instanceof Ext.form.RadioGroup ? field.getValue().inputValue : field.getValue());
//                console.log('change')
//                this.boundRecord.set(field.dataIndex, val);
//                this.updateBound();
//              }
//            }
//          });
//        })
//      }
//    })
//  }
//});

//EHR.ext.recordPanel = Ext.extend(Ext.Panel, {
Ext.override(Ext.Panel, {
  enableOnBind: false,
  getStore : function() {
    return this.store;
  },
  getDataboundFields : function() {
    var fields = [];
    if (this.items) {
      var j = 0;
      for (; j < this.items.getCount(); j++) {
        var item = this.items.itemAt(j);
        if (item.dataIndex)  {
          fields.push(item);
        }
        if (item.getDataboundFields)  {
          var i = 0;
          var other = item.getDataboundFields();
          for (; i < other.length; i++)  {
            fields.push(other[i]);
          }
        }
      }
    }
    return fields;
  },
  onBind:function(record) {
    if(record && (this.boundRecord !== record)) {
      this.internalUpdate = false;
      this.boundRecord = record;
      this.updateBound();

      if (this.enableOnBind)  {
        Ext.each(this.getDataboundFields(), function(f)  {
          f.setDisabled(false);
        }, this);
      }
    }
  },
  onUnbind:function() {
    this.internalUpdate = false;
    this.boundRecord = null;
    Ext.each(this.getDataboundFields(), function(f)  {
      if (this.enableOnBind)  {
        f.setDisabled(true);
      }
      f.setValue(null);
    }, this);
//    this.updateBound();
  },
  walkChildren : function(comp, fn) {
    if (comp.items) {
      comp.items.each(function(f) {
        if (f instanceof Ext.form.Field ) {
          fn.call(this, f);
        }
        else if (f instanceof Ext.form.FieldSet)  {
          fn.call(this, f);
          this.walkChildren(f, fn);
        }
        else if (f instanceof Ext.Panel)  {
          this.walkChildren(f, fn);
        }
      }, this);
    }
  },
  updateBound : function()  {
    if (!this.internalUpdate) {
      this.walkChildren(this, function(f)  {
        if (f.dataIndex)  {
          this.internalUpdate = true;
          f.setValue((this.boundRecord != null ? this.boundRecord.get(f.dataIndex) : null));
          this.internalUpdate = false;
        }
      }, this);
    }
  }
});