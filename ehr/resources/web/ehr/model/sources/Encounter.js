/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/**
 * This is the default metadata applied any record when displayed in the context of an encounter.  An encounter is the special situation in which
 * a task only refers to one ID.  In these cases, there is a single study.Clinical Encounters record, and Id/Date/Project are inherited from this record to children.
 */
EHR.model.DataModelManager.registerMetadata('Encounter', {
    allQueries: {
        Id: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'Id',
                recordSelector: {
                    parentid: 'objectid'
                }
            },
            hidden: true,
            shownInGrid: false
        },
        date: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'date',
                recordSelector: {
                    parentid: 'objectid'
                }
            },
            hidden: true,
            shownInGrid: false
        },
        parentid: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'objectid',
                recordSelector: {
                    parentid: 'objectid'
                }
            },
            hidden: false,
            shownInGrid: false,
            allowBlank: false
        },
        project: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'project',
                recordSelector: {
                    parentid: 'objectid'
                }
            },
            hidden: true,
            shownInGrid: false
        },
        account: {
            inheritance: {
                storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                sourceField: 'account',
                recordSelector: {
                    parentid: 'objectid'
                }
            },
            hidden: true,
            shownInGrid: false
        },
        begindate: {
            getInitialValue: function(v, rec){
                var field = rec.fields.get('begindate');
                var store = Ext.StoreMgr.get('study||Clinical Encounters||||');
                if(store)
                    var record = store.getAt(0);
                if(record)
                    var date = record.get('date');
                if(date)
                    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                return v || date;
            }
        }
    },
    byQuery: {
        'Treatment Orders': {
            date: {
                hidden: false,
                allowBlank: false,
                getInitialValue: function(v, rec){
                    return v ? v : new Date()
                },
                shownInGrid: true
            }
        },
        'Drug Administration': {
            HeaderDate: {
                inheritance: {
                    storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                    sourceField: 'date',
                    recordSelector: {
                        parentid: 'objectid'
                    }
                }
            },
            begindate: {
                hidden: false,
                allowBlank: false
            },
            performedby: {
                allowBlank: true,
                hidden: true
            }
        },
        'Clinical Encounters': {
            parentid: {
                allowBlank: true
            },
            Id: {
                hidden: false
            },
            date: {
                hidden: false,
                label: 'Start Time'
            },
            project: {
                allowBlank: false,
                hidden: false
            },
            type: {
                hidden: false
            },
            remark: {
                label: 'Procedures or Remarks',
                height: 200,
                width: 600,
                editorConfig: {
                    style: null
                }
            },
            title: {
                inheritance: {
                    storeIdentifier:  {queryName: 'tasks', schemaName: 'ehr'},
                    sourceField: 'title',
                    recordSelector: {
                        taskid: 'taskid'
                    }
                },
                hidden: true
            }
        },
        'Clinical Remarks': {
            remark: {
                label: 'Other Remark'
            }
        },
        Housing: {
            performedby: {
                allowBlank: false
            }
        },
        tasks: {
            duedate: {
                inheritance: {
                    storeIdentifier: {queryName: 'Clinical Encounters', schemaName: 'study'},
                    sourceField: 'date',
                    recordSelector: {
                        parentid: 'objectid'
                    }
                },
                hidden: true,
                shownInGrid: false
            }
        }
    }
});