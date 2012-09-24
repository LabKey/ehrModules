/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

var console = require("console");
var LABKEY = require("labkey");

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
            var stackTrace = (error.stackTrace && LABKEY.ExtAdapter.isArray(error.stackTrace) ? error.stackTrace.join('\n') : null);
            var message  = error.exception || error.statusText || error.msg || error.message || '';

            var toLog = [
                'User: ' + LABKEY.Security.currentUser.email,
                'Message: ' + message
            ];
            if(error.exceptionClass)
                toLog.push('Excepton class: ' + error.exceptionClass);
            if(stackTrace)
                message.push(stackTrace);

            console.error(toLog.join('\n'));
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
        },

        /**
         * Used to normalize a java.util.date object into a javascript date object
         * @param date
         */
        normalizeDate: function(date){
            if(!date)
                return date;

            if(LABKEY.ExtAdapter.isString(date))
                return new Date(date);

            return new Date(date.getTime());
        },

        /**
         * Create a combined function call sequence of the original function + the passed function.
         * The resulting function returns the results of the original function.
         */
        createSequence: function(originalFn, newFn, scope) {
            if (!newFn) {
                return originalFn;
            }
            else {
                return function() {
                    var result = originalFn.apply(this, arguments);
                    newFn.apply(scope || this, arguments);
                    return result;
                };
            }
        }
    }
};

