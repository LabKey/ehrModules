/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
LABKEY.ExtAdapter.ns('EHR.DemographicsCache');

EHR.DemographicsCache = new function(){
    var demographicsCache = {};
    var expireThreshold = 30000; //30-second threshold

    function loadDemographics(animalId, callback, scope){
        return LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL('ehr', 'getDemographics'),
            method : 'POST',
            params: {
                ids: [animalId]
            },
            scope: this,
            failure: LDK.Utils.getErrorCallback(),
            success: LABKEY.Utils.getCallbackWrapper(getDemographicsCallback(animalId, callback, scope), this)
        });
    }

    function getDemographicsCallback(animalId, callback, scope){
        return function(json){
            var ret;
            if (json && json.results && json.results[animalId])
            {
                ret = json.results[animalId];
            }

            if (ret)
                ret.loadTime = new Date();

            demographicsCache[animalId] = ret;

            if (callback)
                callback.call(scope || this, animalId, (ret ? new EHR.DemographicsRecord(ret) : null));
        }
    }

    return {
        getDemographics: function(animalId, callback, scope, threshold){
            LDK.Assert.assertNotEmpty('getDemographics called with a null animalId', animalId);

            if (Ext4.isEmpty(animalId)){
                callback.call(scope || this, animalId, null);
                return;
            }
            //reuse cached info if less than threshold
            threshold = threshold || expireThreshold;
            if (demographicsCache[animalId]){
                var ms = (new Date()) - demographicsCache[animalId].loadTime;
                if (ms < expireThreshold || expireThreshold == -1){
                    callback.call(scope || this, animalId, new EHR.DemographicsRecord(demographicsCache[animalId]));
                    return;
                }
            }

            loadDemographics(animalId, callback, scope);
        },

        /**
         *
         * @param Id the animal to clear.  If null, the entire cache will be cleared
         */
        clearCache: function(animalId){
            if (!animalId){
                demographicsCache = {};
            }
            else {
                demographicsCache[animalId] = null;
            }
        }
    }
}
