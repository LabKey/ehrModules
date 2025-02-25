<%
/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
%>
<%@ page import="org.labkey.snd.SNDController.SecurityAction" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>

<style type="text/css">
    .snd-margin-top {
        margin-top: 15px;
    }

    .snd-button {
        width: 200px;
    }

</style>

<labkey:panel title="Links">
    <div class="col-xs-12">
        <a class="labkey-text-link" href="<%=h(urlFor(SecurityAction.class))%>">SND Security</a>
    </div>

</labkey:panel>

<labkey:panel title="Controls">

    <div class="col-xs-12 row clearfix">
        Controls used for SND module setup.
    </div>
    <div class="col-xs-12 snd-margin-top">
        <a id="snd_fillin_cache" class="labkey-button snd-button">Fill In Narrative Cache</a><span id="snd_fillin_cache_msg">&nbsp<i class="fa fa-spinner fa-spin">&nbsp</i> Filling in cache...</span>
    </div>
    <div class="col-xs-12 snd-margin-top">
        <a id="snd_clear_cache" class="labkey-button snd-button">Clear Narrative Cache</a><span id="snd_clear_cache_msg">&nbsp<i class="fa fa-spinner fa-spin">&nbsp</i> Clearing cache...</span>
    </div>
    <div class="col-xs-12 snd-margin-top">
        <a id="snd_populate_qc" class="labkey-button snd-button">Populate QC States</a><span id="snd_populate_qc_msg">&nbsp<i class="fa fa-spinner fa-spin">&nbsp</i> Populating QC states...</span>
    </div>

    <script type="text/javascript" nonce="<%=getScriptNonce()%>">

        (function($) {

            $('#snd_fillin_cache').on('click', startFillInNarrativeCache);
            $('#snd_clear_cache').on('click', startClearNarrativeCache);
            $('#snd_populate_qc').on('click', insertQCStates);

            function showFillingInCacheMsg(show) {
                if (show === true) {
                    $('#snd_fillin_cache_msg').show();
                } else {
                    $('#snd_fillin_cache_msg').hide();
                }
            }

            function showClearingCacheMsg(show) {
                if (show === true) {
                    $('#snd_clear_cache_msg').show();
                } else {
                    $('#snd_clear_cache_msg').hide();
                }
            }

            function showPopulatingQcStateMsg(show) {
                if (show === true) {
                    $('#snd_populate_qc_msg').show();
                } else {
                    $('#snd_populate_qc_msg').hide();
                }
            }

            function fillInCacheSuccess () {
                showFillingInCacheMsg(false);
                LABKEY.Utils.alert("Success","Filling in narrative cache complete.");
            }

            function clearingCacheSuccess () {
                showClearingCacheMsg(false);
                LABKEY.Utils.alert("Success","Narrative cache cleared.");
            }

            function startFillInNarrativeCache() {
                showFillingInCacheMsg(true);
                LABKEY.Ajax.request({
                    success: fillInCacheSuccess,
                    failure: handleFailure,
                    method: 'POST',
                    url: LABKEY.ActionURL.buildURL('snd', 'fillInNarrativeCache.api'),
                    params: {},
                    scope: this
                })
            }

            function startClearNarrativeCache() {
                if (confirm("Repopulating the cache after clearing can take a very long time.  Are you sure you want to clear it?")) {
                    showClearingCacheMsg(true);
                    LABKEY.Ajax.request({
                        success: clearingCacheSuccess,
                        failure: handleFailure,
                        method: 'POST',
                        url: LABKEY.ActionURL.buildURL('snd', 'clearNarrativeCache.api'),
                        params: {},
                        scope: this
                    })
                }
            }

            function insertQCStateSuccess() {
                showPopulatingQcStateMsg(false);
                LABKEY.Utils.alert("Success","QC states inserted");
            }

            function handleFailure(e) {
                showPopulatingQcStateMsg(false);
                showFillingInCacheMsg(false);
                showClearingCacheMsg(false);
                if (e.status === 401) {
                    LABKEY.Utils.alert("Error","Unauthorized");
                }
                else if (JSON.parse(e.responseText).exception) {
                    LABKEY.Utils.alert("Error", JSON.parse(e.responseText).exception);
                }
                else {
                    LABKEY.Utils.alert("Error", "Unknown failure");
                }
            }

            function insertQCStates() {
                showPopulatingQcStateMsg(true);
                LABKEY.Ajax.request({
                    success: insertQCStateSuccess,
                    failure: handleFailure,
                    method: 'POST',
                    url: LABKEY.ActionURL.buildURL('snd', 'populateQCStates.api'),
                    params: {},
                    scope: this
                })
            }

            $(document).ready(function() {
                showFillingInCacheMsg(false);
                showClearingCacheMsg(false);
                showPopulatingQcStateMsg(false);
            })

        })(jQuery);


    </script>


</labkey:panel>