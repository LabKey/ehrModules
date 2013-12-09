/**
 * @cfg targetGrid
 * @cfg parentStore
 * @cfg sourceLabel
 */
Ext4.define('EHR.window.CopyFromSectionWindow', {
    extend: 'Ext.window.Window',

    initComponent: function(){
        this.getParentRecords();

        LABKEY.ExtAdapter.applyIf(this, {
            modal: true,
            width: 750,
            closeAction: 'destroy',
            title: 'Copy From Above',
            bodyStyle: 'padding: 5px;',
            defaults: {
                border: false
            },
            items: [{
                html: 'This helper allows you to populate 1 row for each animal from the ' + this.sourceLabel + ' section.  Choose which IDs to add from the list below.',
                style: 'margin-bottom: 10px;'
            },{
                itemId: 'animalIds',
                items: this.getInitialItems()
            }],
            buttons: [{
                text: 'Submit',
                itemId: 'submitBtn',
                scope: this,
                handler: this.onSubmit
            },{
                text: 'Close',
                handler: function(btn){
                    btn.up('window').close();
                }
            }]
        });

        this.callParent();

        this.on('beforeshow', function(window){
            if (!this.parentRecords.length){
                Ext4.Msg.alert('No Records', 'There are no records to copy.  Note: only records with an Id/Date can be copied.');
                return false;
            }
        }, this);
    },

    getParentRecords: function(){
        var records = [];
        this.parentStore.each(function(r){
            if (r.get('Id') && r.get('date')){
                records.push(r);
            }
        }, this);

        this.parentRecords = records;

        return records;
    },

    getExistingIds: function(){
        var map = {};
        this.targetGrid.store.each(function(r){
            if (r.get('Id'))
                map[r.get('Id')] = true;
        }, this);

        return map;
    },

    getInitialItems: function(){
        var items = [{
            html: '<b>Animal</b>'
        },{
            html: '<b>Date</b>'
        },{
            html: '<b>Skip?</b>'
        }];

        var keys = {}, key;
        Ext4.Array.forEach(this.parentRecords, function(record){
            key = record.get('Id');

            keys[key] = keys[key] || {
                Id: record.get('Id'),
                project: record.get('project'),
                dates: [],
                total: 0
            };

            keys[key].total++;
            keys[key].dates.push(record.get('date'))
        }, this);

        var existingIds = this.getExistingIds();
        Ext4.Array.forEach(Ext4.Object.getKeys(keys), function(key){
            var o = keys[key];

            items.push({
                xtype: 'displayfield',
                key: key,
                value: o.Id,
                fieldName: 'Id'
            });

            var dates = [];
            var minDate;
            Ext4.Array.forEach(o.dates, function(date){
                if (!minDate || date < minDate)
                    minDate = date;

                dates.push(date.format('Y-m-d H:i'));
            }, this);

            items.push({
                xtype: 'xdatetime',
                width: 300,
                format: 'Y-m-d H:i',
                timeFormat: 'H:i',
                fieldName: 'date',
                key: key,
                value: minDate
            });

            items.push({
                xtype: 'checkbox',
                key: key,
                fieldName: 'exclude',
                checked: existingIds[key]
            });
        }, this);

        return [{
            itemId: 'theTable',
            border: false,
            layout: {
                type: 'table',
                columns: 3
            },
            defaults: {
                border: false,
                style: 'margin: 5px;'
            },
            items: items
        }]
    },

    getRows: function(){
        var table = this.down('#theTable');
        var rowMap = {};
        table.items.each(function(item){
            if (item.fieldName){
                rowMap[item.key] = rowMap[item.key] || {};
                rowMap[item.key][item.fieldName] = item.getValue ? item.getValue() : item.value;
            }
        }, this);

        return Ext4.Object.getValues(rowMap);
    },

    onSubmit: function(btn){
        var toAdd = [];
        Ext4.Array.forEach(this.getRows(), function(data){
            if (!data.exclude){
                toAdd.push(this.targetGrid.store.createModel(data));
            }
        }, this);

        if (toAdd.length)
            this.targetGrid.store.add(toAdd);

        this.close();
    }
});


EHR.DataEntryUtils.registerGridButton('COPYFROMSECTION', function(config){
    return Ext4.Object.merge({
        text: 'Copy From Section',
        xtype: 'button',
        tooltip: 'Click to copy records from one of the other sections',
        listeners: {
            beforerender: function(btn){
                var grid = btn.up('gridpanel');
                LDK.Assert.assertNotEmpty('Unable to find gridpanel in COPYFROMSECTION button', grid);

                btn.grid = grid;

                btn.appendButtons.call(btn);
            }
        },
        menu: {
            xtype: 'menu',
            items: [{
                text: 'Loading...'
            }]
        },
        appendButtons: function(){
            this.dataEntryPanel = this.grid.up('ehr-dataentrypanel');
            LDK.Assert.assertNotEmpty('Unable to find dataEntryPanel in COPYFROMSECTION button', this.dataEntryPanel);

            var toAdd = [];
            Ext4.Array.forEach(this.dataEntryPanel.formConfig.sections, function(section){
                if (section.name == this.grid.formConfig.name){
                    return;
                }

                var store = this.dataEntryPanel.storeCollection.getClientStoreByName(section.name);
                if (store){
                    //only allow copying from sections with an ID field
                    if (!store.getFields().get('Id')){
                        return;
                    }

                    toAdd.push({
                        text: section.label,
                        scope: this,
                        handler: function(menu){
                            Ext4.create('EHR.window.CopyFromSectionWindow', {
                                targetGrid: this.grid,
                                sourceLabel: section.label,
                                parentStore: store
                            }).show();
                        }
                    });
                }
            }, this);

            this.menu.removeAll();
            if (toAdd.length){
                this.menu.add(toAdd);
            }
            else {
                this.menu.add({
                    text: 'There are no other sections'
                })
            }
        }
    });
});