/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");
var Ext = require("Ext").Ext;

var EHR = {};
exports.EHR = EHR;

EHR.Server = {};


/**
 * A server-side class of helpers, similar to the client-side EHR.Utils.  The two overlap slightly (the server-side code is a subset of client-side); however,
 * since code cannot truly to shared between client/server at the time of writing there are differences.
 * @class
 */
EHR.Server.Utils = {};


EHR.Server.Utils = new function(){
    var principalMap = {};

    return {
        /*
         * @depreciated EHR.Server.Utils.onFailure instead
         * @param error
         */
//        onError : function(error){
//            console.log('ERROR: ' + error.exception);
//            console.log(error);
//            EHR.Server.Validation.logError(error);
//        },

        /**
         * A helper to return the string displayName of a Principal based on their numeric Id.  This helper caches calls to core.principals
         * in a local variable so it should not need to repeatedly query the server on subsequent calls.
         * @param {integer} id The ID of the principal, which should correspond to a row in core.principals.
         * @returns {string} The string Name of the user, or an empty string if not found
         */
        findPrincipalName: function(id){
            if(!principalMap)
                principalMap = {};

            if(principalMap[id])
                return principalMap[id];

            LABKEY.Query.selectRows({
                schemaName: 'core',
                queryName: 'principals',
                columns: 'UserId,Name',
                filterArray: [
                    LABKEY.Filter.create('UserId', id, LABKEY.Filter.Types.EQUAL)
                ],
                scope: this,
                success: function(data){
                    if(data.rows && data.rows.length)
                        principalMap[id] = data.rows[0].Name;
                },
                failure: EHR.Server.Utils.onFailure
            });

            return principalMap[id] || '';
        },

        /**
         * A helper that will test whether the passed object is empty (ie. {}) or not.
         * @param {object} o The object to test
         * @returns True/false depending on whether the passed object is empty
         */
        isEmptyObj: function(o){
           for(var i in o){ return false;}
           return true;
        },

        /**
         * Provides a generic error callback.  This helper will print the error to the console
         * and will log the error to the audit log table. The user must have insert permissions on /Shared for
         * this to work.
         * @param {Object} error The error object passed to the callback function
         * */
        onFailure: function(error){
            var trace = (error.stackTrace && Ext.isArray(error.stackTrace) ? error.stackTrace.join('\n') : null);
            var comment  = error.exception || error.statusText || error.msg || error.message;
            if(error.exceptionClass)
                comment += '\n' + error.exceptionClass;

            //note: if this transaction is aborted, the insert into auditlog will get rolled back.  therefore we also output to the console in case
            //TODO: would be nice if we could somehow log to auditlog without getting rolled back.
            console.log('ERROR: '+error.exception);
            console.log(error.exceptionClass);
            if(trace)
                console.log(trace);

            LABKEY.Query.insertRows({
                 //it would be nice to store them in the current folder, but we cant guarantee they have write access..
                 containerPath: '/shared',
                 schemaName: 'auditlog',
                 queryName: 'audit',
                 rows: [{
                    EventType: "Client API Actions",
                    Key1: "Client Error In Validation Script",
                    Key3: trace,
                    Comment: comment,
                    Date: new Date()
                 }],
                 success: function(){
                     console.log('Error successfully logged')
                 },
                 failure: function(error){
                    console.log('Problem logging error');
                    console.log(error);
                 }
            });
        },
        
        getMonthString: function(monthValue){
        	var mString;
        switch (monthValue){
           case 0:
                mString = 'January';
                break;
           case 1:
                mString = 'February';
                break;
           case 2:
                mString = 'March';
                break;
           case 3:
                mString = 'April';
                break;
           case 4:
                mString = 'May';
                break;
           case 5:
                mString = 'June';
                break;
           case 6:
                mString = 'July';
                break;
           case 7:
                mString = 'August';
                break;
           case 8:
                mString = 'September';
                break;
           case 9:
                mString = 'October';
                break;
           case 10:
                mString = 'November';
                break;
           default:
                mString = 'December';

        }
        return mString;
        }
    }
};

