/*
 * Copyright (c) 2013-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");

var EHR = {};
exports.EHR = EHR;

EHR.Server = {};

/**
 * A helper that is passed internally within the script to track values and aggregate errors
 * @class
 * @param extraContext
 * @constructor
 */
EHR.Server.ScriptHelper = function(extraContext, event, EHR){
    var startTime = new Date();
    var validationHelper = null;

    var props = {
        event: event,
        javaHelper: org.labkey.ehr.utils.TriggerScriptHelper.create(LABKEY.Security.currentUser.id, LABKEY.Security.currentContainer.id),
        rows: [],
        startTime: new Date(),
        extraContext: extraContext || {},
        queryName: extraContext.queryName,
        schemaName: extraContext.schemaName,
        tablesModified: [(extraContext.schemaName + ';' + extraContext.queryName).toString()],
        notificationRecipients : [],
        participantsModified: [],
        publicParticipantsModified: [],
        importPathway: extraContext.importPathway,
        tasksModified: [],
        requestsModified: [],
        requestsDenied: {},
        requestsCompleted: {},
        requestsApproved: {},
        missingParticipants: [],
        PKsModified: [],
        publicPKsModified: [],
        demographicsMap: {},
        errorQcLabel: 'Review Required',
        verbosity: 0,
        quickValidation: false,
        errorThreshold: null,
        newIdsAdded: {},
        extraBirthFieldMappings: {}
    };

    //test to see if GUID persisted across tables
    props.sessionGUID = extraContext.sessionGUID || LABKEY.Utils.generateUUID();

    /**
     * @name scriptOptions
     * @description Options that can be set in modules using EHR trigger scripts to opt in/out of or alter the behavior
     *              of certain validations and business logic.  If there are specific aspects of the core EHR trigger code that
     *              are problematic for a center, creating additional properties to modify or skip core behaviors is sometimes a good option.
     * @param {Array} datasetsToClose An array of datasets whose records will be closed on animal departure or death.
     * @param {Array} datasetsToCloseOnNewEntry An array of datasets whose records will be closed when a new record for an animal is entered in that dataset.
     * @param {Boolean} allowFutureDates Used for validation to determine if future dates can be entered.
     * @param {Boolean} removeTimeFromDate Save Date without time values.
     * @param {Boolean} removeTimeFromEndDate Save EndDate without time values.
     * @param {Boolean} allowRequestsInPast Allow users to back date requests.
     * @param {Boolean} allowDeadIds Part of row validation to allow dead animal Ids to be valid
     * @param {Boolean} allowAnyId Allow animals whose calculated_status is not alive to be considered valid
     * @param {Boolean} skipIdFormatCheck Skip verification of ID format. Currently only used in WNPRC
     * @param {Boolean} skipHousingCheck Skip housing verification normally done for rows containing ID, room and date
     * @param {Boolean} skipAssignmentCheck Skip assignment verification normally done for rows containing ID, project and date
     * @param {Boolean} notificationTypes
     * @param {String} errorSeverityForImproperHousing Error level for housing validation. ERROR, WARN, INFO, DEBUG
     * @param {String} errorSeverityForImproperAssignment Error level for assignment validation. ERROR, WARN, INFO, DEBUG
     * @param {Boolean} requiresStatusRecalc Recalculate calculated_status when changing a record
     * @param {Boolean} allowDatesInDistantPast Skip validation errors for dates entered > 60 days in the past
     * @param {Array} lookupValidationFields Array of fields to verify lookups return records
     * @param {Boolean} cacheAccount First time a row is entered, lookup account based on project.
     * @param {Boolean} announceAllModifiedParticipants Announce when modified to listeners such as demographics providers
     *                  to update cached records.
     * @param {Boolean} doStandardProtocolCountValidation Validate animals in protocol using ehr.protocolTotalAnimalsBySpecies
     * @param {Boolean} errorSeverityForBloodDrawsWithoutWeight Error level for blood draw requests for animals without weight
     * @param {Map} key extraDemographicsFieldMappings Object of extra demographics fields used in TriggerScriptHelper.onAnimalArrival
     */

    var scriptOptions = {
        datasetsToClose: ['Assignment', 'Cases', 'Housing', 'Treatment Orders', 'Notes', 'Problem List', 'Protocol Assignments', 'Animal Group Members'],
        datasetsToCloseOnNewEntry: [],
        allowFutureDates: false,
        removeTimeFromDate: false,
        removeTimeFromEndDate: false,
        allowRequestsInPast: false,
        // deprecated - use defaultAllowedDaysForFutureRequest to set an explicit date cutoff
        allowRequestsInDistantFuture: false,
        allowDeadIds: false,
        allowAnyId: false,
        skipIdFormatCheck: false,
        skipHousingCheck: false,
        skipAssignmentCheck: false,
        notificationTypes: null,
        errorSeverityForImproperHousing: 'WARN',
        errorSeverityForImproperAssignment: 'INFO',
        requiresStatusRecalc: false,
        allowDatesInDistantPast: false,
        lookupValidationFields: [],
        cacheAccount: true,
        announceAllModifiedParticipants: false,
        doStandardProtocolCountValidation: true,
        errorSeverityForBloodDrawsWithoutWeight: 'ERROR',
        // Use null to indicate any date in the future is acceptable
        defaultAllowedDaysForFutureRequest: 30,
        extraDemographicsFieldMappings: {}
    };

    // Load scriptOptions registered in the module
    var moduleScriptOptions = props.javaHelper.getScriptOptions()
    for (var opt in moduleScriptOptions) { scriptOptions[opt] = moduleScriptOptions[opt]; }

    var cachedValues = {
        liveBirths: {},
        deaths: {},
        arrivals: {},
        departures: {},
        housing: {}
    };

    //allow scripts to register handlers that aggregate row data in this transaction
    var rowProcessors = [];

    function cacheValue(id, date, type){
        if (!cachedValues[type][id]){
            cachedValues[type][id] = [];
        }

        if (cachedValues[type][id].indexOf(date) == -1){
            cachedValues[type][id].push(date);
        }
        else {
            console.log('already exists');
        }
    }

    //NOTE: do i need to call this after init() runs?
    setScriptOptionsFromExtraContext();

    //we allow the client to pass limited options using extraContext
    //this function is where all processing of client JSON -> server options should reside
    function setScriptOptionsFromExtraContext(){
        LABKEY.ExtAdapter.each(['skipIdFormatCheck', 'allowAnyId', 'allowDatesInDistantPast', 'allowRequestsInDistantFuture', 'defaultAllowedDaysForFutureRequest'], function(name){
            if (extraContext[name])
                scriptOptions[name] = extraContext[name];
        }, this);
    }

    return {
        setScriptOptions: function(opts){
            LABKEY.ExtAdapter.apply(scriptOptions, opts);
        },

        getValidationHelper: function(){
            if (validationHelper == null)
                validationHelper = org.labkey.ldk.query.LookupValidationHelper.create(LABKEY.Security.currentContainer.id, LABKEY.Security.currentUser.id, extraContext.schemaName, extraContext.queryName);

            return validationHelper;
        },

        getLookupValidationFields: function(){
            return scriptOptions.lookupValidationFields;
        },

        shouldRemoveTimeFromDate: function(){
            return scriptOptions.removeTimeFromDate;
        },

        shouldAllowRequestsInPast: function(){
            return scriptOptions.allowRequestsInPast;
        },

        shouldAllowRequestsInDistantFuture: function() {
            return scriptOptions.allowRequestsInDistantFuture
        },

        shouldRemoveTimeFromEndDate: function(){
            return scriptOptions.removeTimeFromEndDate;
        },

        isSkipIdFormatCheck: function(){
            return scriptOptions.skipIdFormatCheck;
        },

        getExtraContext: function(){
            return props.extraContext;
        },

        /**
         * Note: In general it is preferred to create a specific getter for script properties expected in
         * core EHR code.  This provides better typing of variables and also allows a single implemention
         * for modifications or checks associated with a property (such as null-handling)
         *
         * Center-specific modules may have instances where they use non-core script options,
         * and accessing from this object directly might make sense.  However, center-specific modules
         * can consider creating their own extension of ScriptHelper that wraps this code as well.
         */
        getScriptOptions: function(){
            return scriptOptions;
        },

        getExtraBirthFieldMappings: function(){
            return scriptOptions.extraBirthFieldMappings || {};
        },

        getExtraDemographicsFieldMappings: function(){
            return scriptOptions.extraDemographicsFieldMappings || {};
        },

        getSchemaName: function(){
            return props.schemaName;
        },

        getQueryName: function(){
            return props.queryName;
        },

        logDebugMsg: function(msg){
            if (props.verbosity > 0)
                console.log(msg);
        },

        getJavaHelper: function(){
            return props.javaHelper;
        },

        getImportPathway: function(){
            return props.importPathway;
        },

        isEHRDataEntry: function(){
            return this.getImportPathway() == 'ehr-ext4DataEntry' || this.getImportPathway() == 'ehr-ext3DataEntry'
        },

        //validateOnly is the old-style flag, and must be differentiated in some places
        isValidateOnly: function(){
            return !!(props.extraContext.isValidateOnly || props.extraContext.validateOnly);
        },

        getTargetQCStateLabel: function(){
            return props.extraContext.targetQC;
        },

        doSkipRequestInPastCheck: function(){
            return !!props.extraContext.skipRequestInPastCheck;
        },

        isETL: function(){
            return props.extraContext.dataSource == 'etl';
        },

        shouldSendNotifications: function(){
            return scriptOptions.notificationTypes != null;
        },

        notificationTypes: function(){
            return scriptOptions.notificationTypes;
        },

        getStartTime: function(){
            return startTime;
        },

        getTimeElapsed: function(){
            return ((new Date()) - startTime) / 1000;
        },

        getRows: function(){
            return props.rows
        },

        addRow: function(row){
            props.rows.push(row);
        },

        runRowProcessors: function(row){
            if (rowProcessors.length){
                for (var i=0; i<rowProcessors.length; i++){
                    rowProcessors[i](this, row);
                }
            }
        },

        registerRowProcessor: function(fn){
            rowProcessors.push(fn);
        },

        setErrorThreshold: function(threshold){
                props.errorThreshold = threshold;
        },

        getErrorThreshold: function(){
            return props.errorThreshold;
        },

        setQuickValidation: function(val){
            props.quickValidation = val;
        },

        isQuickValidation: function(){
            return props.extraContext.quickValidation;
        },

        getDemographicsMap: function(){
            return props.demographicsMap;
        },

        getMissingParticipantArray: function(){
            return props.missingParticipants;
        },

        cacheDemographics: function(id, row){
            props.demographicsMap[id] = row;
        },

        addMissingParticipant: function(id){
            if (props.missingParticipants.indexOf(id) == -1)
                props.missingParticipants.push(id);
        },

        isAllowAnyId: function(){
            return scriptOptions.allowAnyId;
        },

        doStandardProtocolCountValidation: function(){
            return scriptOptions.doStandardProtocolCountValidation;
        },

        isAllowDeadIds: function(){
            return scriptOptions.allowDeadIds;
        },

        isAllowShippedIds: function(){
            return scriptOptions.allowShippedIds;
        },

        addSkippedError: function(recordId, error){
            if (!props.extraContext.skippedErrors)
                props.extraContext.skippedErrors = {};

            if(!props.extraContext.skippedErrors[recordId])
                props.extraContext.skippedErrors[recordId] = [];

            props.extraContext.skippedErrors[recordId].push(error);
        },
        
        isLegacyFormat: function(){
            return props.extraContext.isLegacyFormat;
        },

        getErrorQcLabel: function(){
            return props.errorQcLabel;
        },

        addParticipantModified: function(id, qcLabel){
            if (!id)
                return;

            if (props.participantsModified.indexOf(id) == -1){
                props.participantsModified.push(id);
            }

            if (qcLabel && EHR.Server.Security.getQCStateByLabel(qcLabel).PublicData){
                if (props.publicParticipantsModified.indexOf(id) == -1){
                    props.publicParticipantsModified.push(id);
                }
            }            
        },
        
        getKeyField: function(){
            return props.extraContext.keyField;
        },
        
        addPKModified: function(key, qcLabel){
            if (key && props.PKsModified.indexOf(key) == -1){
                props.PKsModified.push(key);

                if (qcLabel && EHR.Server.Security.getQCStateByLabel(qcLabel).PublicData)
                    props.publicPKsModified.push(key);
            }            
        },
        
        addRequestModified: function(requestId, row, qcLabel, oldQcLabel){
            if (props.requestsModified.indexOf(requestId) == -1)
                props.requestsModified.push(requestId);

            if (qcLabel){
                //track requests being denied
                if (qcLabel == 'Request: Denied' || qcLabel == 'Request: Cancelled'){
                    if (oldQcLabel != 'Request: Denied' && oldQcLabel != 'Request: Cancelled'){
                        if (!props.requestsDenied[requestId])
                            props.requestsDenied[requestId] = [];

                        props.requestsDenied[requestId].push(row);
                    }
                }

                //track requests being completed
                if (qcLabel == 'Completed'){
                    if (oldQcLabel != 'Completed'){
                        if (!props.requestsCompleted[requestId])
                            props.requestsCompleted[requestId] = [];

                        props.requestsCompleted[requestId].push(row);
                    }
                }

                if (qcLabel == 'Request: Approved'){
                    if (oldQcLabel != 'Request: Approved'){
                        if (!props.requestsApproved[requestId])
                            props.requestsApproved[requestId] = [];

                        props.requestsApproved[requestId].push(row);
                    }
                }
            }
        },

        addTaskModified: function(taskId, qcLabel){
            if (props.tasksModified.indexOf(taskId) == -1)
                props.tasksModified.push(taskId);


        },

        getProperty: function(name){
            return props[name];
        },

        setProperty: function(name, val){
            props[name] = val;
        },

        getNotificationRecipients: function(){
            return props.notificationRecipients;
        },

        getRequestsModified: function(){
            return props.requestsModified;
        },

        getRequestsDenied: function(){
            return props.requestsDenied;
        },

        getRequestsCompleted: function(){
            return props.requestsCompleted;
        },

        getParticipantsModified: function(){
            return props.participantsModified;
        },

        getPublicParticipantsModified: function(){
            return props.publicParticipantsModified;
        },

        getPKsModified: function(){
            return props.PKsModified;
        },

        isSkipHousingCheck: function(){
            return scriptOptions.skipHousingCheck
        },

        getTablesModified: function(){
            return props.tablesModified;
        },

        announceAllModifiedParticipants: function(){
            return scriptOptions.announceAllModifiedParticipants;
        },

        // this was added to allow situations like programmatic update of housing records.  the initial update
        // will cause DemographicCache to re-populate, and we dont want the cascade update to trigger this expensive process twice.
        skipAnnounceChangedParticipants: function(){
            return !!props.extraContext.skipAnnounceChangedParticipants;
        },

        // This will prevent looping through multiple times when automatically closing records
        skipClosingRecords: function(){
            return !!props.extraContext.skipClosingRecords;
        },

        isSkipAssignmentCheck: function(){
            return scriptOptions.skipAssignmentCheck
        },

        getRequestDeniedArray: function(){
            var requests = [];
            for (var i in props.requestsDenied){
                requests.push(i);
            }

            return requests;
        },

        getRequestCompletedArray: function(){
            var requests = [];
            for (var i in props.requestsCompleted){
                requests.push(i);
            }

            return requests;
        },

        getRequestApprovedArray: function(){
            var requests = [];
            for (var i in props.requestsApproved){
                requests.push(i);
            }

            return requests;
        },

        getNewIdsAdded: function(){
            return props.newIdsAdded;
        },

        addNewAnimalForProtocol: function(id, protocol){
            if (!props.newIdsAdded[protocol])
                props.newIdsAdded[protocol] = [];

            if (props.newIdsAdded[protocol].indexOf(id) == -1)
                props.newIdsAdded[protocol].push(id);
        },

        getDatasetsToCloseOnNewEntry: function(){
            return scriptOptions.datasetsToCloseOnNewEntry;
        },

        isAllowFutureDates: function(){
            return scriptOptions.allowFutureDates;
        },

        getErrorSeverityForImproperHousing: function(){
            return scriptOptions.errorSeverityForImproperHousing;
        },

        isGeneratedByServer: function(){
            return props.extraContext.generatedByServer;
        },

        doUpdateStatusField: function(){
            if (this.isGeneratedByServer()){
                console.log('skipping calculated_status update for query: ' + this.getQueryName());
                return;
            }

            var ids = this.getPublicParticipantsModified();
            if (ids && ids.length){
                this.getJavaHelper().updateStatusField(ids, cachedValues['liveBirths'], cachedValues['arrivals'], cachedValues['deaths'], cachedValues['departures']);
            }
        },

        isVet: function(){
            return this.getJavaHelper().isVet();
        },

        registerLiveBirth: function(id, date){
            cacheValue(id, date, 'liveBirths');
        },

        registerDeath: function(id, date){
            cacheValue(id, date, 'deaths');
        },

        registerArrival: function(id, date){
            cacheValue(id, date, 'arrivals');
        },

        registerDeparture: function(id, date){
            cacheValue(id, date, 'departures');
        },

        registerHousingChange: function(id, row){
            cacheValue(id, row, 'housing');
        },

        getDeaths: function(){
            return cachedValues['deaths'];
        },

        getHousingChanges: function(){
            return cachedValues['housing'];
        },

        setCenterCustomProps: function(opts){
            this.getJavaHelper().setCenterCustomProps(opts);
        },

        /**
         * When an animal dies or leaves the center, this will close any open records (ie. the death/depart time inserted into the enddate field) for any records in assignment, housing, problem list and treatment orders.
         * @param participant The Id of the participant
         * @param date The date of the event.
         */
        onDeathDeparture: function(id, date){
            //close housing, assignments, treatments
            // console.log('on death departure: ' + id);
            var changedTables = this.getJavaHelper().closeActiveDatasetRecords(scriptOptions.datasetsToClose, id, date);
            if (changedTables){
                changedTables = changedTables.split(';');
                for (var i=0;i<changedTables.length;i++){
                    this.addTableModified('study', changedTables[i]);
                }
            }
        },

        addTableModified: function(schemaName, queryName){
            props.tablesModified.push(schemaName + ';' + queryName);
        },

        isRequiresStatusRecalc: function(){
            return scriptOptions.requiresStatusRecalc;
        },

        getEvent: function(){
            return props.event;
        },

        decodeExtraContextProperty: function(name, defaultValue){
            var prop = props.extraContext[name] || defaultValue || {};
            if (LABKEY.ExtAdapter.isString(prop)){
                prop = LABKEY.ExtAdapter.decode(prop);
            }
            this.setProperty(name, prop);
        },

        getSessionGUID: function(){
            return props.sessionGUID;
        },

        allowDatesInDistantPast: function(){
            //NOTE: if generated by the server, assume we allow past dates.  an example would be birth inserts
            return this.isGeneratedByServer() || scriptOptions.allowDatesInDistantPast;
        },

        getErrorSeverityForImproperAssignment: function(){
            return scriptOptions.errorSeverityForImproperAssignment;
        },

        getSNOMEDCodeFieldName: function(){
            return scriptOptions.snomedCodeFieldName;
        },

        /**
         * Some EHR implementations split the entry of SNOMED codes into separate virtual fields.
         * They may configure an array of fields that should be combined to represent the full set of SNOMED values.
         */
        getSNOMEDSubsetCodeFieldNames: function(){
            return scriptOptions.snomedSubsetCodeFieldNames;
        },

        doCacheAccount: function(){
            return scriptOptions.cacheAccount;
        },

        getErrorSeverityForBloodDrawsWithoutWeight: function(){
            return scriptOptions.errorSeverityForBloodDrawsWithoutWeight;
        },

        getDefaultAllowedDaysForFutureRequest: function(){
            return scriptOptions.allowRequestsInDistantFuture ? null : scriptOptions.defaultAllowedDaysForFutureRequest;
        },

        // itemName is that item's name in the db row, itemLabel is the human-readable name, and itemValue is the actual value of the item
        checkForDuplicateDataEntryItem: function(itemName, itemLabel, itemValue, errors){
            // on actual save draft / submit final, getRows() returns all previous rows we are trying to submit as part of this data entry
            var previousRows = this.getRows();

            if (previousRows && itemValue) {
                previousRows.forEach(function (wrappedPreviousRow) {
                    var previousRow = wrappedPreviousRow.row;

                    if (itemValue && previousRow[itemName]) {
                        if (itemValue === previousRow[itemName])
                            EHR.Server.Utils.addError(errors, itemName, itemLabel + ' ' + itemValue + ' appears more than once', 'ERROR');
                    }
                });
            }
        },

        closeRecordsOnComplete: function(){
            if (!this.isValidateOnly() && !this.isETL() && !this.skipClosingRecords()){
                console.log("closing records");
                var rows = this.getRows();
                var idsToClose = [];
                if (rows){
                    for (var i=0;i<rows.length;i++){
                        if (EHR.Server.Security.getQCStateByLabel(rows[i].row.QCStateLabel).PublicData && rows[i].row.date){
                            idsToClose.push({
                                Id: rows[i].row.Id,
                                date: EHR.Server.Utils.datetimeToString(rows[i].row.date),  //stringify to serialize properly
                                objectid: rows[i].row.objectid
                            });
                        }
                    }
                }

                if (idsToClose.length){
                    //NOTE: this list should be limited to 1 row per animalId
                    this.getJavaHelper().closePreviousDatasetRecords(this.getQueryName(), idsToClose, this.shouldRemoveTimeFromDate());
                }
            }
        }
    }
};
