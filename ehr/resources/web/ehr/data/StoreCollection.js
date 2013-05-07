Ext4.define('EHR.data.StoreCollection', {
    extend: 'Ext.util.MixedCollection',

    constructor: function(){


        this.callParent(arguments);
        this.addEvents('beforecommit', 'commitcomplete', 'commitexception', 'update', 'validation');
    },

    /**
     * Add a store to this collection
     * @memberOf EHR.ext.StoreCollection
     * @param store The store to add.
     */
    add: function(store){
        store = Ext4.StoreMgr.lookup(store);
        if (this.contains(store)){
            return;
        }

        if (!this.containerPath)
            this.containerPath = store.containerPath;

        //check whether container path matches
        if (store.containerPath && store.containerPath != this.containerPath)
            console.error('possible problem: container doesnt match');

        this.callParent([store.storeId, store]);

        Ext4.apply(store, {
            parentStore: this,
            monitorValid: this.monitorValid
        });

        if(this.monitorValid){
            store.on('validation', this.onValidation, this);
            store.initMonitorValid();
        }

        this.initInheritance(store);

        this.relayEvents(store, ['update']);
    },

    //private
    initMonitorValid: function(){
        this.monitorValid = true;
        this.each(function(store){
            store.on('validation', this.onValidation, this);
        }, this);
    },

    //private
    stopMonitorValid: function(){
        this.each(function(store){
            this.store.un('validation', this.onValidation, this);
        }, this);
        this.monitorValid = false;
    },

    /**
     * Removes a child store from this collection
     * @memberOf EHR.ext.StoreCollection
     * @param store The store to remove.
     */
    remove: function(store){
        //TODO: this is done to undo relayEvents() set above.
        if (store.hasListener('update')) {
            store.events['update'].clearListeners();
        }

        store.un('validation', this.onValidation, this);
        delete store.parentStore;

        this.callParent([store]);
    },

    //private
    getChanged: function(commitAll){
        var allCommands = [];
        var allRecords = [];

        this.each(function(s){
            var records;
            if(commitAll)
                records = s.getAllRecords();
            else
                records = s.getModifiedRecords();

            var commands = s.getChanges(records);

            if (commands.length){
                allCommands = allCommands.concat(commands);
                allRecords = allRecords.concat(records);
            }
            else if (commands.length && !records.length){
                console.error('ERROR: there are modified records but no commands');
            }
        }, this);

        return {
            commands: allCommands,
            records: allRecords
        }
    },

    commitChanges : function(extraContext, commitAll) {
        var changed = this.getChanged(commitAll);
        this.commit(changed.commands, changed.records, extraContext);
    },

    commitRecord: function(record, extraContext){
        record.store.commitRecords([record], extraContext);
    },

    //private
    commit: function(commands, records, extraContext){
        extraContext = extraContext || {};

        if (!commands || !commands.length){
//            if(extraContext && extraContext.silent!==true)
//                Ext.Msg.alert('Alert', 'There are no changes to submit.');

            this.onComplete(extraContext);
            return;
        }

        if(this.fireEvent('beforecommit', records, commands, extraContext)===false)
            return;

        var request = Ext4.Ajax.request({
            url : LABKEY.ActionURL.buildURL('query', 'saveRows', this.containerPath),
            method : 'POST',
            success: this.onCommitSuccess,
            failure: this.getOnCommitFailure(records),
            scope: this,
            timeout: this.timeout || 0,
            jsonData : {
                containerPath: this.containerPath,
                commands: commands,
                extraContext: extraContext || {}
            },
            headers : {
                'Content-Type' : 'application/json'
            }
        });

        Ext4.each(records, function(rec){
            rec.lastTransactionId = request.tId;
        }, this);
    },
    /**
     * Will test whether all records in this store collection pass validation or not.
     * @memberOf EHR.ext.StoreCollection
     * @returns {Boolean} True/false depending on whether all records in this StoreCollection pass validation
     */
    isValid: function(){
        var valid = true;
        this.each(function(s){
            if(!s.isValid()){
                valid=false
            }
        }, this);
        return valid;
    },
    /**
     * Tests whether any records in this store collection are dirty
     * @returns {boolean} True/false depending on whether any records in the collection are dirty.
     */
    isDirty: function()
    {
        var dirty = false;
        this.each(function(s){
            if(s.getModifiedRecords().length)
                dirty = true;
        }, this);
        return dirty;
    },

    //private
    //tests whether any store are loading or not
    isLoading: function(){
        var isLoading = false;
        this.each(function(s){
            if(s.isLoading){
                isLoading = true;
            }
        }, this);

        return isLoading;
    },

    //private
    //returns an array of the queries represented in this store
    getQueries: function(){
        var queries = [];
        this.each(function(s){
            queries.push({
                schemaName: s.schemaName,
                queryName: s.queryName
            })
        }, this);
        return queries;
    },

    //private
    onValidation: function(store, records){
        //check all stores
        var maxSeverity = '';
        this.each(function(store){
            maxSeverity = EHR.Utils.maxError(maxSeverity, store.maxErrorSeverity());
        }, this);

        this.fireEvent('validation', this, maxSeverity);
    },

    //private
    getErrors: function(){
        var errors = [];
        this.each(function(store){
            store.errors.each(function(error){
                errors.push(error);
            }, this);
        }, this);

        return errors;
    },

    //private
    getOnCommitFailure : function(records) {
        return function(response, options) {
            //note: should not matter which child store they belong to
            for(var idx = 0; idx < records.length; ++idx)
                delete records[idx].saveOperationInProgress;

            var serverError = this.getJson(response);
            var msg = '';
            if(serverError && serverError.errors){
                //each error should represent 1 row.  there can be multiple errors per row
                Ext4.each(serverError.errors, function(rowError){
                    //handle validation script errors and exceptions differently
                    if(rowError.errors && rowError.errors.length && rowError.row){
                        this.handleValidationErrors(rowError, response, serverError.extraContext);
                        msg = rowError.exception || "Could not save changes due to errors.  Please check the form for fields marked in red.";
                    }
                    else {
                        //if an exception was thrown, I believe we automatically only have one error returned
                        //this means this can only be called once
                        msg = 'Could not save changes due to the following error:\n' + (serverError && serverError.exception) ? serverError.exception : response.statusText;
                    }
                }, this);

                if(!serverError.errors){
                    msg = 'Could not save changes due to the following error:\n' + serverError.exception;
                }
            }

            if(false !== this.fireEvent("commitexception", msg, serverError) && (options.jsonData.extraContext && !options.jsonData.extraContext.silent)){
                Ext4.Msg.alert("Error", "Error During Save. "+msg);
                console.error(serverError);
            }
        };
    },

    //private
    handleValidationErrors: function(serverError, response, extraContext){
        var store = this.get(extraContext.storeId);
        var record = store.getById(serverError.row._recordid);
        if(record){
            store.handleValidationError(record, serverError, response, extraContext);
        }
        else {
            console.error('ERROR: Record not found');
            console.error(serverError);
        }
    },

    //private
    onCommitSuccess : function(response, options){
        var json = this.getJson(response);
        if(!json || !json.result)
            return;

        for (var i=0;i<json.result.length;i++){
            var result = json.result[i];
            var store = this.find(function(s){
                return s.queryName==result.queryName && s.schemaName==result.schemaName;
            });

            if(!options.jsonData || !options.jsonData.extraContext || !options.jsonData.extraContext.successURL)
                store.processResponse(result.rows);
        }

        this.onComplete((options.jsonData ? options.jsonData.extraContext : null));
    },

    //private
    onComplete: function(extraContext){
        this.fireEvent("commitcomplete");

        if(extraContext && extraContext.successURL){
            window.onbeforeunload = Ext4.emptyFn;
            window.location = extraContext.successURL;
        }
    },

    //private
    getJson : function(response) {
        return (response && undefined != response.getResponseHeader && undefined != response.getResponseHeader('Content-Type')
                && response.getResponseHeader('Content-Type').indexOf('application/json') >= 0)
                ? Ext4.util.JSON.decode(response.responseText)
                : null;
    },

    //private
    deleteAllRecords: function(extraContext){
        //NOTE: we delegate the deletion to each store, and track progress here so we can fire a single event
        var storesPerformingDeletes = [];
        var failures = 0;

        this.each(function(s){
            var records = [];
            s.each(function(r){
                records.push(r);
            }, this);

            function onComplete(response){
                s.un('commitcomplete', onComplete);
                s.un('commitexception', onComplete);

                if(storesPerformingDeletes.indexOf(s.storeId)!=-1){
                    storesPerformingDeletes.remove(s.storeId)
                }

                if(!storesPerformingDeletes.length){
                    if(failures == 0){
                        this.onComplete(extraContext);
                    }
                    else {
                        this.fireEvent('commitexception');
                    }
                }
            }

            s.on('commitcomplete', onComplete, this, {single: true});
            s.on('commitexception', onComplete, this, {single: true});

            storesPerformingDeletes.push(s.storeId);
            s.deleteRecords(records, extraContext);
        }, this);
    },

    //private
    //this is distinct from deleteAllRecords.  instead of deleting the records, it changes the QCState to 'Delete Requested'.  these
    //records are deleted periodically by a separate cron script.  this exists b/c historically delete performance was extrememly poor.
    //this has been fixed and the data entry code should probably be refactored to directly delete the records.
    requestDeleteAllRecords: function(options){
        options = options || {};

        //add a context flag to the request to saveRows
        var extraContext = Ext4.apply({
            importPathway: 'ehr-importPanel'
            //,targetQC : 'Delete Requested'
        }, options);

        var commands = [];
        var records = [];
        this.each(function(s){
            s.removePhantomRecords();
            s.each(function(r){
                var recs = [];
                r.beginEdit();
                if(r.get('requestid') || r.get('requestId')){
                    //note: we reject changes since we dont want to retain modifications made in this form
                    r.reject();

                    //reset the date
                    if(r.get('daterequested'))
                        r.set('date', r.get('daterequested'));

                    //remove from this task
                    if(s.queryName!='tasks')
                        r.set('taskid', null);

                    r.set('QCState', EHR.Security.getQCStateByLabel('Request: Approved').RowId);
                    r.set('qcstate', EHR.Security.getQCStateByLabel('Request: Approved').RowId);
                }
                else {
                    r.set('QCState', EHR.Security.getQCStateByLabel('Delete Requested').RowId);
                    r.set('qcstate', EHR.Security.getQCStateByLabel('Delete Requested').RowId);
                }
                recs.push(r);


                if(recs.length){
                    var changes = s.getChanges(recs);
                    if(changes.length){
                        commands = commands.concat(changes);
                        records = records.concat(recs);
                    }
                }
            }, this);
        }, this);

        //NOTE: since this will navigate away from this page, we dont need to bother removing
        //these records from the store
        if(commands.length){
            this.commit(commands, records, extraContext);
        }
        else {
            this.onComplete(extraContext);
        }
    },

    //private
    //returns all records in all child stores
    getAllRecords: function(){
        var records = [];
        this.each(function(s){
            s.each(function(r){
                records.push(r)
            }, this);
        }, this);
        return records;
    },

    //private
    //NOTE: used for development.  should get removed eventually
    showStores: function(){
        this.each(function(s){
            if(s.getCount()){
                console.log(s.storeId);
                console.log(s);
                console.log('Num Records: '+s.getCount());
                console.log('Total Records: '+s.getTotalCount());
                console.log('Modified Records:');
                console.log(s.getModifiedRecords());
                s.each(function(rec)
                {
                    console.log('record ID: '+rec.id);
                    console.log('record is dirty?: '+rec.dirty);
                    console.log('record is phantom?: '+rec.phantom);
                    console.log('saveOperationInProgress? '+rec.saveOperationInProgress);
                    Ext4.each(rec.fields.keys, function(f){
                        console.log(f + ': ' + rec.get(f));
                    }, s);
                }, s)
            }
        }, this);
    },

    //private
    //for debugging purposes
    showErrors: function(){
        console.log(this.getErrors());
    }
});
