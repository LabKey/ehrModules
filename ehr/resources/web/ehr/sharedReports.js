EHR.reports.FileRepository =  function(panel,tab) {
    if (tab.filters.subjects){
        var animalIds = tab.filters.subjects[0];
        renderFiles(animalIds,tab);
    }

    function renderFiles(subjects, tab)
    {
        if (!subjects.length){
            tab.add({
                html:'No animals were found',
                border : false
            });

            return;
        }

        if (subjects.length === 0)
            return;

        // WebdavFileSystem depends on ExtJS3 so load it it dynamically
        LABKEY.requiresExt3ClientAPI(function() {
            Ext.onReady(function() {
                var containerPath = LABKEY.container.path + '/FileRepository';
                var animalFolder = new LABKEY.FileSystem.WebdavFileSystem({baseUrl: LABKEY.ActionURL.getBaseURL() + '_webdav' + containerPath + '/@files/' + animalIds + '/'});
                var location = {id: animalIds};

                var panel = tab.add({id: 'filesDiv', style: 'margin-bottom:20px'});

                var handler = function (location) {
                    var webPart = new LABKEY.WebPart({
                        title: 'File Repository for ' + animalIds,
                        partName: 'Files',
                        renderTo: 'filesDiv-body',
                        containerPath: containerPath,
                        partConfig: {path: location},
                        success: function () {
                            panel.setHeight(450);
                        }
                    });
                    webPart.render();

                };

                animalFolder.listFiles({
                    success: function () {
                        handler(location.id);
                    },
                    path: "/",
                    failure: function () {
                        LABKEY.Security.getUserPermissions({
                            containerPath: containerPath,
                            success: function (userPermsInfo) {
                                var hasInsert = false;
                                for (var i = 0; i < userPermsInfo.container.effectivePermissions.length; i++) {
                                    if (userPermsInfo.container.effectivePermissions[i] == 'org.labkey.api.security.permissions.InsertPermission') {
                                        hasInsert = true;
                                    }
                                }
                                if (hasInsert) {
                                    panel.add({
                                        xtype: 'ldk-webpartpanel',
                                        title: 'File Repository for ' + animalIds,
                                        items: [
                                            {
                                                xtype: 'label',
                                                text: 'No directory found for this animal. To upload files, you must create the folders first.  '
                                            },
                                            {
                                                xtype: 'label',
                                                html: '<br/><br/>'

                                            },
                                            {
                                                xtype: 'button',
                                                style: 'margin-left: 10px;',
                                                border: true,
                                                text: 'Create Folders',
                                                handler: function () {
                                                    animalFolder.createDirectory({
                                                        path: "/",
                                                        success: function () {
                                                            const folders = [
                                                                "Surgery Sheets",
                                                                "Radiology Reports",
                                                                "Misc Docs",
                                                                "Arrival Docs",
                                                                "Images",
                                                                "Pathology Reports",
                                                                "Lab Reports",
                                                                "Procurement Docs",
                                                                "Dental Records",
                                                                "Cardiology Docs",
                                                                "Anesthesia Reports"
                                                            ];

                                                            var createdCount = 0;

                                                            folders.forEach(function (folder) {
                                                                animalFolder.createDirectory({
                                                                    path: "/" + folder,
                                                                    success: function () {
                                                                        createdCount++;
                                                                        if (createdCount === folders.length) {
                                                                            handler(location.id);
                                                                        }
                                                                    },
                                                                    failure: function (error) {
                                                                        console.error("failed to create " + folder + " folder" + error.status)
                                                                    }
                                                                })
                                                            });
                                                        },
                                                        failure: function (error) {
                                                            console.error("failed to created folder" + error.status)
                                                        }
                                                    })

                                                }

                                            }]
                                    });
                                }
                                else {
                                    panel.add({
                                        xtype: 'ldk-webpartpanel',
                                        title: 'File Repository for ' + animalIds,
                                        items: [
                                            {
                                                xtype: 'label',
                                                text: 'The current animal does not have any files, and you do not have permission to upload new files.'
                                            }]
                                    });
                                }
                            },
                            failure: function (error, response) {
                                var message;
                                if (response.status == 404) {
                                    message = 'The folder ' + containerPath + ' does not exist, so no files can be shown or uploaded. Contact EHR services to correct the configuration.';
                                }
                                else if (response.status == 401 || response.status == 403) {
                                    message = 'You do not have permission to upload or view files. Contact EHR services to get permission.';
                                }
                                else {
                                    message = 'There was an error attempting to load the file data: ' + response.status;
                                }
                                panel.add({
                                    xtype: 'ldk-webpartpanel',
                                    title: 'File Repository for ' + animalIds,
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: message
                                        }]
                                });
                            }
                        });
                    },

                    forceReload: true
                });


                if (File && File.panel && File.panel.Browser && File.panel.Browser._pipelineConfigurationCache) {
                    File.panel.Browser._pipelineConfigurationCache = {};
                }
            });
        }, this);
    }
};