LABKEY.ExtAdapter.ns('EHR.DemographicsCache');

EHR.DemographicsCache = new function(){
    var demographicsCache = {};
    var expireThreshold = 30000; //30-second threshold

    function loadDemographics(animalId, callback, scope){
        //TODO: this should become a real server-side API
        var multi = new LABKEY.MultiRequest();
        var cache = {};

        multi.add(LABKEY.Query.selectRows, {
            schemaName: this.schemaName || 'study',
            queryName: this.queryName || 'demographics',
            viewName: this.viewName || 'Clinical Summary',
            filterArray: [LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL)],
            scope: this,
            success: function(results){
                if (results && results.rows && results.rows.length){
                    cache.demographics = new LDK.SelectRowsRow(results.rows[0]);
                }
            },
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1
        });

        multi.add(LABKEY.Query.selectRows, {
            schemaName: this.schemaName || 'study',
            queryName: this.queryName || 'flags',
            columns: 'Id,date,category,value,category/doHighlight,category/omitFromOverview',
            filterArray: [
                LABKEY.Filter.create('Id', animalId, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('isActive', true, LABKEY.Filter.Types.EQUAL),
                LABKEY.Filter.create('category/omitFromOverview', true, LABKEY.Filter.Types.NEQ_OR_NULL)
            ],
            scope: this,
            success: function(results){
                cache.flags = [];

                if (results && results.rows && results.rows.length){
                    Ext4.Array.forEach(results.rows, function(r){
                        cache.flags.push(new LDK.SelectRowsRow(r));
                    }, this);
                }
            },
            failure: LDK.Utils.getErrorCallback(),
            requiredVersion: 9.1
        });

        multi.send(getDemographicsCallback(animalId, cache, callback, scope), this);
    }

    function getDemographicsCallback(animalId, cache, callback, scope){
        return function(){
            cache.loadTime = new Date();
            demographicsCache[animalId] = cache;

            if (callback)
                callback.call(scope || this, animalId, cache);
        }
    }

    return {
        getDemographics: function(animalId, callback, scope){
            LDK.Assert.assertNotEmpty('getDemographics called with a null animalId', animalId);

            if (Ext4.isEmpty(animalId)){
                callback.call(scope || this, animalId, null);
                return;
            }
            //reuse cached info if less than threshold
            if (demographicsCache[animalId]){
                var ms = (new Date()) - demographicsCache[animalId].loadTime;
                if (ms < expireThreshold){
                    callback.call(scope || this, animalId, demographicsCache[animalId]);
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
