var console = require("console");
var LABKEY = require("labkey");

var EHR = {};
exports.EHR = EHR;

EHR.Server = {};
EHR.Server.TriggerManager = {};


EHR.Server.TriggerManager = new function(){
    var events = {};
    var queryEvents = {};

    return {
        /**
         * Constants representing the hooks available for triggers
         * @type {Object}
         */
        Events: {
            INIT: 'init',
            BEFORE_INSERT: 'beforeInsert',
            AFTER_INSERT: 'afterInsert',
            BEFORE_DELETE: 'beforeUpdate',
            AFTER_DELETE: 'afterUpdate',
            BEFORE_UPDATE: 'beforeUpdate',
            AFTER_UPDATE: 'afterUpdate',
            BEFORE_UPSERT: 'beforeUpsert',
            AFTER_UPSERT: 'afterUpsert',
            ON_BECOME_PUBLIC: 'onBecomePublic',
            AFTER_BECOME_PUBLIC: 'afterBecomePublic',
            COMPLETE: 'complete'
        },

        /**
         *
         * @param event
         * @param handler
         */
        registerHandler: function(event, handler){
            if (!events[event]){
                events[event] = [];
            }

            events[event].push(handler);
        },

        registerHandlerForQuery: function(event, schemaName, queryName, handler){
            if (!queryEvents[schemaName]){
                queryEvents[schemaName] = {};
            }

            if (!queryEvents[schemaName][queryName]){
                queryEvents[schemaName][queryName] = {};
            }

            if (!queryEvents[schemaName][queryName][event]){
                queryEvents[schemaName][queryName][event] = [];
            }

            queryEvents[schemaName][queryName][event].push(handler);
        },

        getHandlers: function(event){
            return events[event];
        },

        getHandlersForQuery: function(event, schemaName, queryName){
            if (!queryEvents[schemaName][queryName])
                return null;

            if (!queryEvents[schemaName][queryName])
                return null;

            return queryEvents[schemaName][queryName][event];
        }
    }
};