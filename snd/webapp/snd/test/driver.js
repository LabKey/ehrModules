/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


(function($) {

    var CONTAINER,
        tests = {},
        testOrder = [],
        beforeTestsFn,
        callbackCounter = 0;

    var groupIds = {};  // group id cache

    var TEST_URLS = {
        GET_EVENT_URL: LABKEY.ActionURL.buildURL('snd', 'getEvent.api'),
        SAVE_EVENT_URL: LABKEY.ActionURL.buildURL('snd', 'saveEvent.api'),
        DELETE_EVENT_URL: LABKEY.ActionURL.buildURL('query', 'deleteRows.api'),
        SAVE_PKG_URL: LABKEY.ActionURL.buildURL('snd', 'savePackage.api'),
        GET_PKG_URL: LABKEY.ActionURL.buildURL('snd', 'getPackages.api'),
        SAVE_PROJECT_URL: LABKEY.ActionURL.buildURL('snd', 'saveProject.api'),
        REGISTER_TEST_TRIGGER_URL: LABKEY.ActionURL.buildURL('snd', 'registerTestTriggerFactory.api'),
        UPDATE_ROLE_URL: LABKEY.ActionURL.buildURL('snd', 'updateRole.api'),
        IMPERSONATE_GROUP_URL: LABKEY.ActionURL.buildURL('user', 'impersonateGroup.api'),
        IMPERSONATE_ROLES_URL: LABKEY.ActionURL.buildURL('user', 'impersonateRoles.api'),
        ADD_ASSIGNMENT_URL: LABKEY.ActionURL.buildURL('security', 'addAssignment.api'),
        CLEAR_ASSIGNMENTS_URL: LABKEY.ActionURL.buildURL('security', 'clearAssignedRoles.api'),
        STOP_IMPERSONATING_URL: LABKEY.ActionURL.buildURL('login', 'stopImpersonating.api')
    };

    var report = {
        completed: false,
        times: {},
        testsPassed: 0,
        testsRan: 0,
        testsTotal: 0,

        abort: function() {
            this.stopAll();
            this.completed = false;

            this.__display();
        },

        clear: function() {
            this.completed = false;
            this.times = {};
            this.testsPassed = 0;
            this.testsRan = 0;
            this.testsTotal = 0;
        },

        complete: function() {
            this.stopAll();
            this.completed = true;

            this.__display();
        },

        summary: function() {
            if (this.completed) {
                var total = this.times['~~total~~'];
                var totalTime = total.stop - total.start;
                return 'Complete in ' + totalTime + ' ms. Passed tests: ' + this.testsPassed + ', Failed tests: ' + (this.testsRan - this.testsPassed) + ', Total tests: ' + this.testsTotal;
            }

            return 'Aborted.';
        },

        start: function(name) {
            if (!this.times['~~total~~']) {
                this.times['~~total~~'] = {
                    start: new Date()
                }
            }

            if (!this.times[name]) {
                this.times[name] = {
                    start: new Date()
                };
            }
            else {
                console.warn('Attempted to start timer "' + '" multiple times.');
            }
        },

        stop: function(name) {
            if (this.times[name]) {
                this.times[name].stop = new Date();
            }
            else {
                console.warn('Attempted to stop timer "' + name + '" before it was started');
            }
        },

        stopAll: function() {
            for (var t in this.times) {
                if (this.times.hasOwnProperty(t)) {
                    if (!this.times[t].stop) {
                        this.stop(t);
                    }
                }
            }
        },

        __display: function() {
            console.log('completed:', this.completed);
            console.log('times (in ms):\n');
            for (var t in this.times) {
                if (t !== '~~total~~' && this.times.hasOwnProperty(t)) {
                    console.log('\t' + t + ':', this.times[t].stop - this.times[t].start);
                }
            }
            console.log('tests passed:', this.testsPassed);
            console.log('tests ran:', this.testsRan);
            console.log('tests total:', this.testsTotal);
        }
    };

    function log(msg, status, clear, append, clearIfNotError) {
        var log = $('.snd-test-log');
        var logDiv = $('.test-log');

        if (clear) {
            log.html(msg);
        }
        else if (clearIfNotError && logDiv.attr("class").indexOf("test-log-failure") === -1) {
            log.html(msg);
        }
        else {
            log.html(log.html() + (append ? '' : '<br>') + msg);
        }

        if (status === 'success') {
            if (clearIfNotError) {
                if (logDiv.attr("class").indexOf("test-log-failure") === -1) {
                    logDiv.addClass('test-log-success');
                    logDiv.removeClass('test-log-failure');
                }
            }
            else {
                logDiv.addClass('test-log-success');
                logDiv.removeClass('test-log-failure');
            }
        }
        else if (status === 'failure') {
            logDiv.addClass('test-log-failure');
            logDiv.removeClass('test-log-success');
        }
        else {
            if (clearIfNotError) {
                if (logDiv.attr("class").indexOf("test-log-failure") === -1) {
                    logDiv.removeClass('test-log-success test-log-failure');
                }
            }
            else {
                logDiv.removeClass('test-log-success test-log-failure');
            }
        }
        logDiv.scrollTop(logDiv.prop('scrollHeight'));
    }

    function handleFailure(json, msg) {
        var jsonResponse = null;
        if (json && json.exception) {
            jsonResponse = json;
        }
        else if (json && json.responseText) {
            jsonResponse = JSON.parse(json.responseText);
        }
        if (jsonResponse && jsonResponse.exception) {
            msg += (': ' + jsonResponse.exception);
        }

        log(msg, 'failure', true);

        if (jsonResponse && jsonResponse.stackTrace) {
            showStackTrace(jsonResponse.exception, jsonResponse.stackTrace)
        }
    }

    function renderTests() {
        var html = ['<table>'];

        html.push(
                '<thead>',
                '<tr>',
                '<th class="test-results-list"><b>Test Name</b></th>',
                '<th class="test-results-list"><b>Status</b></th>',
                '<th class="test-results-list"><b>Reason</b></th>',
                '</tr>',
                '</thead>'
        );

        html.push('<tbody>');

        for (var t in tests) {
            if (tests.hasOwnProperty(t)) {
                var status = tests[t].status;
                var statusColor = tests[t].error ? '#ED2C10' : (status === 'passed' ? '#A5DDAD' : 'black');

                var indent = '';
                for (var i = 0; i < tests[t].depth; i++) {
                    indent += '&nbsp;&nbsp;';
                }

                html.push(
                        '<tr class="test-results-row">',
                        '<td class="test-results-list">' + indent + tests[t].name + '</td>',
                        '<td class="test-results-list"><span style="color: ' + statusColor + '">' + tests[t].status + '</span></td>',
                        '<td class="test-results-list">' + (tests[t].error ? tests[t].error : '') + '</td>',
                        '</tr>'
                );
            }
        }

        html.push('</tbody>');
        html.push('</table>');

        $('.snd-test-runner-frame').html(html.join(''));
    }

    function registerTest(test, parent, depth) {

        if (!test.name) {
            throw new Error('Each test requires a name');
        }
        if (tests[test.name]) {
            throw new Error('Test with name "' + test.name + '" was previously registered.');
        }

        test.error = undefined;
        test.status = 'not run';
        test.depth = depth;
        tests[test.name] = test;
        testOrder.push(test.name);

        test.parent = undefined;
        if (parent) {
            test.parent = parent.name;
        }

        renderTests();
    }

    function initTests(tests, parent, depth) {
        for (var t = 0; t < tests.length; t++) {
            if (tests[t].disabled !== true) {
                registerTest(tests[t], parent, depth);

                if (tests[t].dependents) {
                    initTests(tests[t].dependents, tests[t], depth+1);
                }
            }
        }
    }

    function showStackTrace(exception, stackTrace) {
        var html = ['<div><br>'];
        html.push(exception + '<br>');

        for (var s = 0; s < stackTrace.length; s++) {
            if (s > 10) {
                html.push('...');
                break;
            }
            html.push(stackTrace[s] + '<br>');
        }

        html.push('</div>');
        $('.snd-test-data-frame').html(html.join(''));
    }

    function showMismatchData(test, actual) {
        var html = ['<div>'];
        html.push('<br><u>' + test + ' - Failure</u><br>');
        html.push(actual)

        html.push('</div>');
        $('.snd-test-data-frame').html(html.join(''));
    }

    function saveCategories(cb) {

        var categoryData = LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_CATEGORIES;
        var categoryIds = [];

        for (var i = 0; i < categoryData.length; i++)
        {
            categoryIds.push(categoryData[i].CategoryId);
        }

        LABKEY.Query.selectRows({
            schemaName: 'snd',
            queryName: 'PkgCategories',
            columns: ['CategoryId'],
            scope: this,
            filterArray: [LABKEY.Filter.create('CategoryId', categoryIds.join(';'), LABKEY.Filter.Types.IN)],
            failure: function (json) {
                handleFailure(json, 'Failed category initialization');
            },
            success: function (results) {

                var existing = [], updateRows = [], insertRows = [];
                for (var r = 0; r < results.rows.length; r++) {
                    existing.push(results.rows[r]["CategoryId"]);
                }

                for (var c = 0; c < categoryData.length; c++) {
                    if (existing.indexOf(categoryData[c].CategoryId) !== -1) {
                        updateRows.push(categoryData[c]);
                    }
                    else {
                        insertRows.push(categoryData[c]);
                    }
                }

                var command = [];

                if (updateRows.length > 0) {
                    command.push({
                        command: 'update',
                        schemaName: 'snd',
                        queryName: 'PkgCategories',
                        rows: updateRows
                    })
                }

                if (insertRows.length > 0) {
                    command.push({
                        command: 'insert',
                        schemaName: 'snd',
                        queryName: 'PkgCategories',
                        rows: insertRows
                    })
                }

                if (command.length > 0) {
                    LABKEY.Query.saveRows({
                        commands: command,
                        scope: this,
                        failure: function (json) {
                            handleFailure(json, 'Failed category initialization.');
                        },
                        success: function (results) {
                            cb();
                        }
                    });
                }
            }
        })
    }

    function initSecurity(cb) {
        saveGroups(function () {initAssignments(function () {saveRoles(cb)})});
    }

    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    }

    var groupCount;
    function initAssignments(cb) {
        var groupData = LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_GROUPS;
        groupCount = Object.keys(groupData).length;

        for (var group in groupData) {
            if (groupData.hasOwnProperty(group)) {

                LABKEY.Ajax.request({
                    url: TEST_URLS.CLEAR_ASSIGNMENTS_URL,
                    jsonData: {
                        principalId: groupIds[group]
                    },
                    scope: this,
                    failure: function (json) {
                        handleFailure(json, 'Failed clearing group permissions.');
                    },
                    success: function (response) {
                        var roleCount = groupData[group].roles.length;
                        for (var r = 0; r < groupData[group].roles.length; r++) {
                            LABKEY.Ajax.request({
                                url: TEST_URLS.ADD_ASSIGNMENT_URL,
                                jsonData: {
                                    principalId: groupIds[group],
                                    roleClassName: groupData[group].roles[r]
                                },
                                scope: this,
                                failure: function (json) {
                                    handleFailure(json, 'Failed assigning group permission.');
                                },
                                success: function () {
                                    roleCount--;
                                    if (roleCount === 0) {
                                        groupCount--;
                                    }

                                    if (groupCount === 0) {
                                        cb();
                                    }
                                }
                            });
                            sleep(1000);  // hacky but these api calls are not designed for rapid calls
                        }
                    }
                });
            }
        }
    }

    function saveGroups(cb) {
        var groupData = LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_GROUPS;
        groupCount = Object.keys(groupData).length;
        for (var group in groupData) {
            console.log("Saving group: " + group);
            if (groupData.hasOwnProperty(group)) {
                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL("security", "createGroup"),
                    method: "POST",
                    jsonData: {name: group},
                    scope: this,
                    failure: function (json) {
                        console.log("Save group failure. Group: " + group);
                        var noProblem = false;
                        if (json && json.responseText) {
                            var jsonResponse = JSON.parse(json.responseText);

                            if (jsonResponse && jsonResponse.exception) {

                                // Group already exists so get group id
                                if (jsonResponse.exception.indexOf("already exists") !== -1) {
                                    noProblem = true;
                                    console.log("Group already saved. Looking up group. Group: " + group);
                                    LABKEY.Query.selectRows({
                                        schemaName: 'core',
                                        queryName: 'Principals',
                                        columns: ['UserId', 'Name'],
                                        scope: this,
                                        filterArray: [LABKEY.Filter.create('Name', group, LABKEY.Filter.Types.EQUALS)],
                                        failure: function (json) {
                                            handleFailure(json, 'Failed category initialization');
                                        },
                                        success: function (results) {
                                            console.log("Successfully looked up group " + group);
                                            console.log("Looked up group rows " + results.rows.length);
                                            groupCount--;
                                            if (results.rows.length > 0) {
                                                console.log("Adding name: " + results.rows[0].Name, ", userid: " + results.rows[0].UserId);
                                                groupIds[results.rows[0].Name] = results.rows[0].UserId;
                                            }
                                            if (groupCount === 0) {
                                                cb();
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        if (!noProblem) {
                            handleFailure(json, 'Failed permission group initialization');
                        }
                    },
                    success: function (response) {
                        console.log("Save group success. Group: " + group);
                        var json = JSON.parse(response.responseText);

                        groupIds[json.name] = json.id;
                        groupCount--;
                        if (groupCount === 0)
                            cb();
                    }
                });
            }
        }
    }

    function saveRoles(cb) {
        var roleData = LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_ROLES_ASSIGNMENT;
        var multi = new LABKEY.MultiRequest();
        for (var i = 0; i < roleData.length; i++) {
            multi.add(LABKEY.Ajax.request,
                    {
                        method: 'POST',
                        url: TEST_URLS.UPDATE_ROLE_URL,
                        jsonData: roleData[i],
                        failure: function (json) {
                            handleFailure(json, 'Failed SND roles initialization');
                        }
                    });
        }

        multi.send(cb, this);
    }

    // Save packages one at a time
    function savePackage(index, cb) {
        var pkgIds = [];
        var packageData = LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PACKAGES[index].jsonData;

        for (var i = 0; i < packageData.subPackages.length; i++) {
            pkgIds.push(packageData.subPackages[i].pkgId)
        }

        // console.log('savePackage, selectRows TopLevelSuperPkgs - index: ' + index);
        LABKEY.Query.selectRows({
            schemaName: 'snd',
            queryName: 'TopLevelSuperPkgs',
            columns: ['SuperPkgId', 'PkgId'],
            scope: this,
            filterArray: [LABKEY.Filter.create('PkgId', pkgIds.join(';'), LABKEY.Filter.Types.IN)],
            failure: function (json) {
                handleFailure(json, 'Failed package initialization');
            },
            success: function(results) {
                var subPackages = [];
                // console.log('savePackage, selectRows TopLevelSuperPkgs SUCCESS - index: ' + index);
                for (var r = 0; r < results.rows.length; r++) {
                    for (var p = 0; p < packageData.subPackages.length; p++) {
                        if (packageData.subPackages[p].pkgId === results.rows[r]["PkgId"]) {
                            packageData.subPackages[p].superPkgId = results.rows[r]["SuperPkgId"];
                            subPackages.push(packageData.subPackages[p]);
                        }
                    }
                }

                packageData.subPackages = subPackages;

                // console.log('savePackage, savePackage api - index: ' + index);
                LABKEY.Ajax.request({
                    method: 'POST',
                    url: TEST_URLS.SAVE_PKG_URL,
                    jsonData: packageData,
                    scope: this,
                    failure: function (json) {
                        handleFailure(json, 'Failed package initialization');
                    },
                    success: function() {
                        // Only call callback when all have returned
                        // console.log('savePackage, savePackage api SUCCESS - index: ' + index);
                        index++;
                        if (index === LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PACKAGES.length) {
                            // console.log('savePackage, callback - index: ' + index);
                            cb();
                        } else {
                            var msg = 'Initializing data....';
                            for (var d = 0; d < index; d++) {
                                msg += '.'
                            }

                            log(msg, null, true);
                            savePackage(index, cb);
                        }
                    }
                });
            }
        });
    }

    // Save projects in parallel
    function saveProject(projectData, cb) {
        var pkgIds = [];

        for (var i = 0; i < projectData.projectItems.length; i++) {
            pkgIds.push(projectData.projectItems[i].pkgId)
        }

        LABKEY.Query.selectRows({
            schemaName: 'snd',
            queryName: 'TopLevelSuperPkgs',
            columns: ['SuperPkgId', 'PkgId'],
            scope: this,
            filterArray: [LABKEY.Filter.create('PkgId', pkgIds.join(';'), LABKEY.Filter.Types.IN)],
            failure: function (json) {
                handleFailure(json, 'Failed project initialization');
            },
            success: function(results) {
                var projectItems = [];
                for (var r = 0; r < results.rows.length; r++) {
                    for (var p = 0; p < projectData.projectItems.length; p++) {
                        if (projectData.projectItems[p].pkgId === results.rows[r]["PkgId"]) {
                            projectData.projectItems[p].superPkgId = results.rows[r]["SuperPkgId"];
                            projectItems.push(projectData.projectItems[p]);
                        }
                    }
                }
                projectData.projectItems = projectItems;

                LABKEY.Ajax.request({
                    method: 'POST',
                    url: TEST_URLS.SAVE_PROJECT_URL,
                    jsonData: projectData,
                    scope: this,
                    failure: function (json) {
                        handleFailure(json, 'Failed project initialization');
                    },
                    success: function() {
                        // Only call callback when all have returned
                        callbackCounter++;
                        if (callbackCounter === LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PROJECTS.length ) {
                            cb();
                        }
                    }
                });
            }
        });
    }

    function initPackageData(cb) {
        log('Initializing data...', null, true);

        savePackage(0, cb);
    }

    function initProjectData(cb) {
        callbackCounter = 0;

        for (var i = 0; i < LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PROJECTS.length; i++) {
            saveProject(LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PROJECTS[i].jsonData, cb);
        }
    }

    function initData(cb) {
        saveCategories(function() {initSecurity(function() {cleanTestData(function() {initPackageData(function () {initProjectData(cb)})})})});
    }

    function impersonateSNDTestUser(cb) {
        if (groupIds["SNDTestGroup"]) {
            LABKEY.Ajax.request({
                url: TEST_URLS.IMPERSONATE_GROUP_URL,
                jsonData: {groupId: groupIds["SNDTestGroup"]},
                scope: this,
                failure: function (json) {
                    handleFailure(json, 'Failed impersonation.');
                },
                success: function () {
                    cb();
                }
            });
        }
    }

    function impersonateRoles(roles, cb) {
        LABKEY.Ajax.request({
            url: TEST_URLS.IMPERSONATE_ROLES_URL,
            jsonData: {roleNames: roles},
            scope: this,
            failure: function (json) {
                handleFailure(json, 'Failed impersonating role.');
            },
            success: function () {
                cb();
            }
        });
    }

    function stopImpersonating(cb) {
        LABKEY.Ajax.request({
            url: TEST_URLS.STOP_IMPERSONATING_URL,
            method: 'POST',
            scope: this,
            failure: function (json) {
                handleFailure(json, 'Failed to stop impersonation.');
            },
            success: function () {
                if (typeof cb === "function")
                    cb();
            }
        });
    }

    function registerTestTriggerFactory(cb) {
        LABKEY.Ajax.request({
            url: TEST_URLS.REGISTER_TEST_TRIGGER_URL,
            scope: this,
            failure: function (json) {
                handleFailure(json, 'Failed test trigger initialization.');
            },
            success: function() {
                cb();
            }
        });
    }

    function unregisterTestTriggerFactory(cb) {
        LABKEY.Ajax.request({
            url: TEST_URLS.REGISTER_TEST_TRIGGER_URL,
            jsonData: {'unregister': true},
            scope: this,
            failure: function (json) {
                handleFailure(json, 'Failed test trigger unregister.');
            },
            success: cb
        });
    }

    function deleteProject(projectId, cb) {
        LABKEY.Query.selectRows({
            schemaName: 'snd',
            queryName: 'Projects',
            columns: ['ObjectId'],
            scope: this,
            filterArray: [LABKEY.Filter.create('ProjectId', projectId, LABKEY.Filter.Types.EQUALS)],
            failure: function (json) {
                handleFailure(json, 'Failed project delete');
            },
            success: function(results) {
                if (results.rows.length > 0) {
                    var objectId = results.rows[0]["ObjectId"].value;

                    LABKEY.Query.deleteRows({
                        schemaName: 'snd',
                        queryName: 'Projects',
                        rows: [{'ObjectId': objectId}],
                        scope: this,
                        failure: function (json) {
                            handleFailure(json, 'Failed project delete');
                        },
                        success: function () {
                            // Only call callback when all have returned
                            callbackCounter++;
                            if (callbackCounter === LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PROJECTS.length) {
                                cb();
                            }
                        }
                    });
                }
                else if (++callbackCounter === LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PROJECTS.length) {
                    cb();
                }
            }
        });
    }

    function deletePackage(pkgId, cb) {

        LABKEY.Query.deleteRows({
            schemaName: 'snd',
            queryName: 'Pkgs',
            rows: [{'PkgId': pkgId}],
            scope: this,
            failure: function (json) {
                handleFailure(json, 'Failed project delete');
            },
            success: function () {
                // Only call callback when all have returned
                callbackCounter++;
                if (callbackCounter === LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PACKAGES.length) {
                    cb();
                }
            }
        });
    }

    function cleanProjects(cb) {
        callbackCounter = 0;

        for (var i = 0; i < LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PROJECTS.length; i++) {
            deleteProject(LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PROJECTS[i].jsonData.projectId, cb);
        }
    }

    function cleanPackages(cb) {
        callbackCounter = 0;

        for (var i = 0; i < LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PACKAGES.length; i++) {
            deletePackage(LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PACKAGES[i].jsonData.id, cb);
        }
    }

    function cleanData() {
        cleanProjects(
                function() { cleanPackages(
                        function() {
                            log("Data cleaned", 'success', true);
                            log('Tests are ready to run.', undefined, false); }
                );});
    }

    function deleteEvents(cb) {
        for (var i = 0; i < LABKEY.getCleanData().EVENTIDS.length; i++) {
            LABKEY.Query.deleteRows({
                schemaName: 'snd',
                queryName: 'Events',
                rows: [{'EventId': LABKEY.getCleanData().EVENTIDS[i]}],
                scope: this,
                failure: function (json) {
                    handleFailure(json, 'Failed event delete');
                },
                success: function () {
                    // Only call callback when all have returned
                    callbackCounter++;
                    if (callbackCounter === LABKEY.getCleanData().EVENTIDS.length) {
                        log('Test data cleaned.', null, true);
                        log('Tests are ready to run.', null, false);
                        if (cb && cb instanceof Function) {
                            cb();
                        }
                    }
                }
            });
        }
    }

    function cleanTestData(cb) {
        callbackCounter = 0;

        impersonateSNDTestUser(function() {deleteEvents(function() {stopImpersonating(cb)})});
    }

    function cachePkg(pkg) {
        if (LABKEY.SND_PKG_CACHE[pkg.pkgId] === undefined) {
            LABKEY.SND_PKG_CACHE[pkg.pkgId] = [];
        }

        LABKEY.SND_PKG_CACHE[pkg.pkgId].push(pkg);

        if (pkg.subPackages) {
            for (var j = 0; j < pkg.subPackages.length; j++) {
                cachePkg(pkg.subPackages[j])
            }
        }
    }

    function cachePkgs(cb) {
        LABKEY.SND_PKG_CACHE = {};
        var pkgs = LABKEY.getInitData().BEFORE_ALL_TESTS.INIT_PACKAGES;
        var pkgIds = [];
        for (var p = 0; p < pkgs.length; p++) {
            pkgIds.push(pkgs[p]["jsonData"]["id"])
        }

        LABKEY.Ajax.request({
            url: TEST_URLS.GET_PKG_URL,
            jsonData: {packages: pkgIds, includeFullSubpackages: true},
            scope: this,
            failure: function (json) {
                handleFailure(json, 'Failed package caching');
            },
            success: function (json) {
                var responseJson = JSON.parse(json.response).json;
                for (var j = 0; j < responseJson.length; j++) {
                    cachePkg(responseJson[j]);
                }
                LABKEY.SND_PKG_CACHE['loaded'] = true;

                cb();
            }
        });
    }

    function init(tests, beforeTests) {

        // initDomains(domains);
        initTests(tests, null, 0);

        if ($.isFunction(beforeTests)) {
            beforeTestsFn = beforeTests;
        }

        renderTests();
        log('Tests are ready to run.', undefined, false, false, true);
    }

    function reset() {

        // reset report
        report.clear();
        report.testsTotal = testOrder.length;

        // reset tests
        for (var t in tests) {
            if (tests.hasOwnProperty(t)) {
                tests[t].error = undefined;
                tests[t].status = 'not run';
            }
        }

        // renderData();
    }

    function runAllCleanTests() {

        reset();

        report.start('setup');

        CONTAINER = LABKEY.container.name;

        log('Running tests...', undefined, true);

        if ($.isFunction(beforeTestsFn)) {
            beforeTestsFn();
        }

        report.stop('setup');

        report.start('testing');
        testRunner(-1, function () {
            report.stop('testing');
            report.complete();
            var status = 'failure';
            if (report.completed && (report.testsRan - report.testsPassed) === 0) {
                status = 'success';
            }
            log(report.summary(), status, true);
            stopImpersonating(unregisterTestTriggerFactory);
        });
    }

    function runAllTests() {

        registerTestTriggerFactory(
                function() {
                    cleanTestData(
                            function() {
                                impersonateSNDTestUser(runAllCleanTests)
                            });
                }
        );
    }

    function runTest(test, context, cb) {
        report.start('test - ' + test.name);

        var finish = function(error, context) {
            report.stop('test - ' + test.name);
            var passed = error === undefined;

            if (passed) {
                report.testsPassed++;
            }
            report.testsRan++;

            var config = {
                context: context,
                passed: passed,
                error: error
            };

            if (test.roles) {
                stopImpersonating(function() {impersonateSNDTestUser(function() {cb(config)})});
            }
            else {
                cb(config);
            }
        };

        var handleExpectedFailure = function(name, error) {

            var json;

            try {
                json = JSON.parse(error.responseText);
            }
            catch (e) {
                // could have responded html...
                finish('Test "' + test.name + '" unexpectedly failed. Response not JSON.');
                handleFailure(json, 'Test "' + test.name + '" stack trace.');
                return;
            }

            if ($.isFunction(testRun.expectedFailure)) {
                var result = testRun.expectedFailure(error, json);
                if (result === true) {
                    finish();
                }
                else if (LABKEY.Utils.isString(result)) {
                    finish('Test "' + test.name + '" failed. ' + result);
                    handleFailure(json, 'Test "' + test.name + '" stack trace.');
                }
                else {
                    finish('Test "' + test.name + '" failed. Test should specify a reason for failure or return true.');
                    handleFailure(json, 'Test "' + test.name + '" stack trace.');
                }
            }
            else {
                var exception = json.exception;
                if (!exception) {
                    exception = json.event.exception.message;
                }
                exception = exception.trim();

                if (exception === testRun.expectedFailure) {
                    if (testRun.expected) {
                        var result = LABKEY.handleExpectedResponse(name, testRun.expected, error, json);
                        if (result !== true) {
                            finish(result);
                        }
                        else {
                            finish();
                        }
                    }
                    else {
                        finish();
                    }
                }
                else {
                    finish('Test "' + test.name + '" failed.<br>Expected: \"' + testRun.expectedFailure + '\"<br>Actual: \"' + exception + '\"');
                    handleFailure(json, 'Test "' + test.name + '" stack trace.');
                }
            }
        };

        var compareResponse = function(actualJson, expectedObject) {
            var actualResponse = JSON.stringify(actualJson);
            var expectedResponse = JSON.stringify(expectedObject);

            if (actualResponse === expectedResponse) {
                finish();
            }
            else {
                finish('Test "' + test.name + '" response did not match expected response.<br/>Expected: "' + expectedResponse + '"<br/>Actual: "' + actualResponse + '"');
            }
        };

        if (test.run === undefined) {
            finish('Test "' + test.name + '" is not runnable. Configured improperly, expected run() to be implemented');
        }
        else {

            var testRun;

            var runTest = function() {
                try {
                    testRun = test.run(context);
                }
                catch (e) {
                    var msg;
                    if (LABKEY.Utils.isString(e)) {
                        msg = e;
                    }
                    else {
                        msg = e.message;
                        console.error('Stacktrace for test \"' + test.name + '\"');
                        console.error(e.stack);
                    }

                    finish('Test "' + test.name + '" failed. An uncaught error was thrown: \"' + msg + '\". See console for additional output.');
                    return;
                }

                if (LABKEY.Utils.isString(testRun)) {
                    finish('Test "' + test.name + '" failed. ' + testRun);
                }
                else if (testRun !== undefined && testRun.request !== undefined && (testRun.response !== undefined || testRun.expectedFailure)) {

                    var testRequest = {
                        url: testRun.request.url,
                        method: testRun.request.method || null,
                        jsonData: $.isFunction(testRun.request.jsonData) ? testRun.request.jsonData() : testRun.request.jsonData
                    };

                    if (testRun.request.headers) {
                        testRequest.headers = testRun.request.headers;
                    }

                    if (testRun.expectedFailure) {
                        testRequest.success = function (response) {
                            var successJson;

                            try {
                                successJson = JSON.parse(response.responseText);
                            }
                            catch (e) {
                                successJson = null;
                            }

                            if (successJson != null) {
                                if (successJson.event["exception"]) {
                                    handleExpectedFailure(test.name, response);
                                }
                                else {
                                    finish('Test "' + test.name + '" unexpectedly succeeded.');
                                }
                            }
                            else {
                                finish('Test "' + test.name + '" is missing json response');
                            }
                        };
                        testRequest.failure = function (response) {
                            handleExpectedFailure.call(this, test.name, response)
                        };
                    }
                    else {
                        testRequest.success = function (response) {
                            var json;

                            try {
                                json = JSON.parse(response.responseText);
                            }
                            catch (e) {
                                // could have responded html...
                                finish('Test "' + test.name + '" unexpectedly failed. Response not JSON.');
                                return;
                            }

                            if ($.isFunction(testRun.response)) {
                                var result = testRun.response(response, json);
                                if (result === true) {
                                    finish();
                                }
                                else if (LABKEY.Utils.isString(result)) {
                                    finish('Test "' + test.name + '" failed. ' + result);
                                }
                                else if (LABKEY.Utils.isObject(result)) {
                                    finish(undefined, result);
                                }
                                else if (json?.event?.exception?.message) {
                                    finish('Test "' + test.name + '" failed. ' + json.event.exception.message);
                                }
                                else {
                                    finish('Test "' + test.name + '" failed. Test should specify a reason for failure or return true.');
                                }
                            }
                            else {
                                compareResponse(json, testRun.response);
                                return;
                            }
                        };
                        testRequest.failure = function (error) {
                            if (error) {
                                try {
                                    var json = JSON.parse(error.responseText);

                                    if (LABKEY.Utils.isObject(testRun.response)) {
                                        compareResponse(json, testRun.response);
                                        return;
                                    }
                                    else if (json && json.exception) {
                                        finish(error.status + ': ' + json.exception);
                                        handleFailure(json, 'Test "' + test.name + '" stack trace.');
                                    }
                                }
                                catch (e) {
                                    // could have responded html...
                                    finish('Test "' + test.name + '" unexpectedly failed. Response not JSON.');
                                }
                            }
                            else {
                                finish('Test "' + test.name + '" unexpectedly failed. No error provided.');
                            }
                        };
                    }

                    LABKEY.Ajax.request(testRequest);
                }
                else {
                    finish('Test "' + test.name + '" is not runnable. Returned improper configuration.');
                }
            }

            if (test.roles) {
                stopImpersonating(function() {impersonateRoles(test.roles, runTest)})
            }
            else {
                runTest();
            }
        }
    }

    function testRunner(index, cb) {

        if (testOrder.length === 0) {
            renderTests();
            cb();
        }
        else if (index < testOrder.length - 1) {

            index++;
            var context;
            var test = tests[testOrder[index]];

            if (test.parent) {
                var parent = tests[test.parent];
                if (parent.error !== undefined) {
                    test.error = 'Not run due to failure of \"' + test.parent + '\"';
                    testRunner(index, cb);
                    return;
                }

                context = parent.context;
            }

            test.status = 'Running...';
            renderTests();

            runTest(test, context, function(result) {
                test.status = result.error ? 'failed' : 'passed';
                if (result.error) {
                    test.error = result.error;
                }

                if (result.context) {
                    test.context = result.context;
                }

                testRunner(index, cb);
            });
        }
        else {
            renderTests();
            cb();
        }
    }

    function getSubpackageSuperPkgId(pkgId, subPackages) {
        var superPkgId = null;

        subPackages.forEach(function(sub) {
            if (sub.pkgId == pkgId) {
                superPkgId = sub.superPkgId;
            }
        }, this);

        return superPkgId;
    }

    function getRunBtn() {
        return $('.snd-test-run-btn');
    }

    function getCleanInitBtn() {
        return $('.snd-test-clean-init-btn');
    }

    function getCleanTestBtn() {
        return $('.snd-test-clean-test-btn');
    }

    function getUnregisterTestTriggerBtn() {
        return $('.snd-test-unregister-test-triggers-btn');
    }

    $(function() {
        // bind inputs
        getRunBtn().on('click', runAllTests);
        getCleanInitBtn().on('click', cleanData);
        getCleanTestBtn().on('click', cleanTestData);
        getUnregisterTestTriggerBtn().on('click', unregisterTestTriggerFactory);
    });

    LABKEY.testDriver = function(tests, beforeTests) {
        $(function() {
            init(tests, beforeTests);
        });
    };

    LABKEY.getAttributeByName = function (attributes, name) {
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].name === name) {
                return attributes[i];
            }
        }
        return null;
    };

    LABKEY.initData = function (cb) {
        initData(
            function () {
                cachePkgs(cb);
            }
        )
    };

    LABKEY.showStackTrace = showStackTrace;
    LABKEY.showMismatchData = showMismatchData;
    LABKEY.handleSndFailure = handleFailure;
    LABKEY.getSubpackageSuperPkgId = getSubpackageSuperPkgId;

    LABKEY.SND_TEST_URLS = TEST_URLS;

})(jQuery);