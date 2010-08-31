/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.ns('Ext.ux.layout');

/**
 * Creates new ColumnFitLayout
 * @constructor
 * @param {Object} config A config object
 */
Ext.ux.layout.ColumnFitLayout  = Ext.extend(Ext.layout.ColumnLayout, {
    onLayout:function(ct, target) {
                // call parent
        Ext.ux.layout.ColumnFitLayout.superclass.onLayout.apply(this, arguments);

                // get columns and height
        var cs = ct.items.items, len = cs.length, c, i;
        var size = Ext.isIE && target.dom != Ext.getBody().dom ? target.getStyleSize() : target.getViewSize();
        var h = size.height - target.getPadding('tb');

                // set height of columns
        for(i = 0; i < len; i++) {
            c = cs[i];
            c.setHeight(h + (c.footer ? c.footer.getHeight() : 0));
        }
    }
});

// register layout
Ext.Container.LAYOUTS['columnfit'] = Ext.ux.layout.ColumnFitLayout;

// eof


// To play in Firebug uncomment next line
// Ext.get(document.body).update('<div id="ext-test"></div>');

// reference local blank image
Ext.BLANK_IMAGE_URL = '/extjs/lib/resources/images/default/s.gif';

// create namespace
Ext.namespace('Test');

// create application
Test.app = function() {
  // do NOT access DOM from here; elements don't exist yet

  // private variables

  var cityStore = new Ext.data.SimpleStore({
    url: '/examples/data2',
    fields: ['cityId', 'cityName']
  });

  var countryStore = new Ext.data.SimpleStore({
    fields: ['alpha2code','name'],
    data: [["BE","Belgium"],["BR","Brazil"],["BG","Bulgaria"],["CA","Canada"],["CL","Chile"],["CY","Cyprus"],["CZ","Czech Republic"],["FI","Finland"],["FR","France"],["DE","Germany"],["HU","Hungary"],["IE","Ireland"],["IL","Israel"],["IT","Italy"],["LV","Latvia"],["LT","Lithuania"],["MX","Mexico"],["NL","Netherlands"],["NZ","New Zealand"],["NO","Norway"],["PK","Pakistan"],["PL","Poland"],["RO","Romania"],["SK","Slovakia"],["SI","Slovenia"],["ES","Spain"],["SE","Sweden"],["CH","Switzerland"],["GB","United Kingdom"]]
  });

  var countryCombo = new Ext.form.ComboBox({
    id: 'countryCmb',
    fieldLabel: 'Country',
    hiddenName: 'ddi_country',
    emptyText: 'Select a country...',
    store: countryStore,
    displayField: 'name',
    valueField: 'alpha2code',
    selectOnFocus: true,
    mode: 'local',
    typeAhead: true,
    editable: false,
    triggerAction: 'all',
    value: 'GB'
  });

  var cityCombo = new Ext.form.ComboBox({
    id: 'cityCmb',
    fieldLabel: "City",
    hiddenName: 'cityId',
    name: "city",
    triggerAction: "all",
    emptyText: "Loading...",
    store: cityStore,
    mode:'local',
    displayField: "cityName",
    lazyInit: false,
    valueField: "cityId",
    forceSelection: true,
    valueNotFoundText: 'Loading...',
    editable: false
  });

  var myText = new Ext.form.TextField({
    fieldLabel: 'debug',
    name: 'text'
  });

  // private functions
  countryCombo.on('select', function(){
    cityCombo.reset();
    cityCombo.store.load({params:{ddi_country: countryCombo.getValue()}});
  });

  cityCombo.on('select', function() {
    myText.setValue(cityCombo.getValue());
  });

  cityCombo.store.on('load', function(){
    if (countryCombo.getValue() == 'GB') cityCombo.setValue(1);
    else cityCombo.setValue(cityCombo.store.getAt(0).get('cityId'));
    myText.setValue(cityCombo.getValue());
  });

  cityCombo.store.load({params:{ddi_country: 'GB'}});

  // public space
  return {
    // public properties, e.g. strings to translate

    // public methods
    init: function() {
      var myForm = new Ext.FormPanel({
        labelWidth: 125, // label settings here cascade unless overridden
        frame:true,
        renderTo: 'ext-test',
        title: 'Test panel',
        bodyStyle:'padding:5px 5px 0',
        width: 450,
        items: [ countryCombo, cityCombo, myText ] //items
      }); // end of Ext.FormPanel

    } // end of init
  };
}(); // end of app

Ext.onReady(Test.app.init, Test.app);