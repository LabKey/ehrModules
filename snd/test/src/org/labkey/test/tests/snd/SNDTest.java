/*
 * Copyright (c) 2017-2019 LabKey Corporation
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

package org.labkey.test.tests.snd;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.CommandResponse;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.DeleteRowsCommand;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.remoteapi.query.TruncateTableCommand;
import org.labkey.remoteapi.query.UpdateRowsCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.TestProperties;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.Git;
import org.labkey.test.components.CustomizeView;
import org.labkey.test.components.bootstrap.ModalDialog;
import org.labkey.test.components.snd.AttributeGridRow;
import org.labkey.test.components.snd.AttributesGrid;
import org.labkey.test.components.snd.CategoryEditRow;
import org.labkey.test.components.snd.FilterSelect;
import org.labkey.test.components.snd.PackageViewerResult;
import org.labkey.test.components.snd.ProjectViewerResult;
import org.labkey.test.components.snd.SuperPackageRow;
import org.labkey.test.pages.snd.EditCategoriesPage;
import org.labkey.test.pages.snd.EditPackagePage;
import org.labkey.test.pages.snd.EditProjectPage;
import org.labkey.test.pages.snd.PackageListPage;
import org.labkey.test.pages.snd.ProjectListPage;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Maps;
import org.labkey.test.util.SqlserverOnlyTest;
import org.labkey.test.util.core.webdav.WebDavUploadHelper;
import org.openqa.selenium.WebElement;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.WebTestHelper.buildURL;

@Category ({Git.class})
@BaseWebDriverTest.ClassTimeout(minutes = 15)
public class SNDTest extends BaseWebDriverTest implements SqlserverOnlyTest
{
    private static final String PROJECTNAME = "SNDTest Project";
    private static final String TEST1SUBFOLDER = "Test1";
    private static final String TEST1PATH = PROJECTNAME + "/" + TEST1SUBFOLDER;
    private static final String PKGSTESTCOL = "testPkgs1";
    private static final String EXTCOLTESTDATA1 = "testString 1";
    private static final String EXTCOLTESTDATA2 = "testString 2";
    private static final String EXTCOLTESTDATA3 = "testString 3";
    private static final String EXTCOLTESTDATA3A = "updated testString 3";

    // When creating packages and categories, the preferred method is to allow the id to be set automatically
    // by the auto incrementing column.  If the package id or category id must be set manually, package ids must be
    // less than 1000 and category ids must be less than 100.  If they do not meet those restrictions, the package
    // or category will be created but the id will be set using the auto incremented identity column.
    private static final int TEST_PKG_ID = 800;
    private static final int TEST_PKG_ID1 = 801;
    private static final int TEST_PKG_ID2 = 802;
    private static final int TEST_PKG_ID3 = 806;
    private static final int TEST_PKG_ID4 = 807;
    private static final int TEST_CATEGORY_ID1 = 50;
    private static final int TEST_CATEGORY_ID2 = 51;
    private static final int TEST_CATEGORY_ID3 = 52;
    private static final int TEST_CATEGORY_ID4 = 53;
    private static final int TEST_SUPER_PKG_START_ID1 = 130;
    private static final int TEST_SUPER_PKG_START_ID2 = 140;
    private static final int TEST_SUPER_PKG_START_ID3 = 150;
    private static final int TEST_SUPER_PKG_START_ID4 = 160;
    private static final int TEST_SUPER_PKG_START_ID5 = 170;
    private static final String TEST_SUPER_PKG_DESCRIPTION_1 = "My package description2";
    private static final String TEST_SUPER_PKG_DESCRIPTION_2 = "My package description3";
    private static final String TEST_SUPER_PKG_DESCRIPTION_3 = "My package description4";
    private static final String TEST_SUPER_PKG_DESCRIPTION_4 = "My package description5";

    private static final int TEST_PARTICIPANT_ID = 1;

    private static final int TEST_PROJECT_ID = 50;
    private static final int PKG_TEST_PROJECT_ID = 55;
    private static final int TEST_PROJECT_REF_ID = 100;
    private static final String TEST_PROJECT_START_DATE = "2018-01-01";
    private static final String TEST_PROJECT_DB_START_DATE = "2018-01-01";
    private static final String TEST_PROJECT_END_DATE = "2018-01-02";
    private static final String TEST_PROJECT_FUTURE_END_DATE = "2030-01-02";
    private static final String TEST_PROJECT_DB_END_DATE = "2018-01-02";
    private static final String TEST_PROJECT_COMMON_DATE = "2018-02-10";
    private static final String TEST_PROJECT_DESC = "Project Test";
    private static final String TEST_PROJECT_DESC2 = "Project Test2";
    private static final String TEST_EDIT_PROJECT_DESC = "Edited Project";
    private static final String TEST_REV_PROJECT_DESC = "Revised Project";
    private static final String TEST_PROJECT_DEFAULT_PKGS = "'default'";
    private static final int TEST_IMPORT_SUPERPKG1 = 5100;
    private static final int TEST_IMPORT_SUPERPKG2 = 5150;
    private static final int TEST_IMPORT_SUPERPKG3 = 5275;

    private static final String UITEST_PROJECT_SUBPKG1 = "TB and Weight";
    private static final String UITEST_PROJECT_SUBPKG2 = "Vet Comment";
    private static final String UITEST_PROJECT_SUBPKG3 = "Ketamine Sedation";

    private static final String CREATEDOMAINSAPI ="LABKEY.Domain.create({\n" +
            "   domainGroup: 'test',        \n" +
            "   domainKind: 'SND',          \n" +
            "   module: 'snd',              \n" +
            "   importData: false,          \n" +
            "   success: onSuccess,         \n" +
            "   failure: onFailure          \n" +
            "});                            \n" +
            "function onFailure(e)          \n" +
            "{                              \n" +
            "   callback(e.exception);      \n" +
            "}                              \n" +
            "                               \n" +
            "function onSuccess()           \n" +
            "{                              \n" +
            "   callback('Success!');       \n" +
            "}                              \n";


    private static final String SAVEPACKAGEAPI_NOCHILDREN = "LABKEY.Ajax.request({         \n" +
        "    method: 'POST',                                                    \n" +
        "    url: LABKEY.ActionURL.buildURL('snd', 'savePackage.api'),          \n" +
        "    success: function(){ callback('Success!'); },\n" +
        "    failure: function(e){ callback(e.responseText); },                 \n" +
        "    jsonData: {                                                        \n" +
        "        'id' : '" + TEST_PKG_ID + "',                                  \n" +
        "		 'testIdNumberStart': '" + TEST_SUPER_PKG_START_ID5 + "',       \n" +
        "        'description': 'My package description',                       \n" +
        "        'active': true,                                                \n" +
        "        'repeatable': true,                                            \n" +
        "        'narrative': 'This is a narrative for {SNDName} ({SNDUser}), age {SNDAge}',\n" +
        "        'categories': ['" + TEST_CATEGORY_ID3 + "', '" + TEST_CATEGORY_ID4 + "'],\n" +
        "        'subPackages': [],                                             \n" +
        "        'extraFields': {'UsdaCode':'B'},                               \n" +
        "        'attributes': [{                                               \n" +
        "            'name': 'SNDName',                                         \n" +
        "            'label': 'Name',                                           \n" +
        "            'rangeURI': 'string',                                      \n" +
        "            'required': false,                                         \n" +
        "            'scale': 500,                                              \n" +
        "            'validators': [{                                           \n" +
        "               'name': 'SNDLength',                                    \n" +
        "               'description': 'This will check the length of the field',\n" +
        "               'type': 'textlength',                                       \n" +
        "               'expression': '~gte=1&amp;~lte=400',                    \n" +
        "               'errorMessage': 'This value must be between 1 and 400 characters long'  \n" +
        "           }]                                                          \n" +
        "           },{                                                         \n" +
        "           'name': 'SNDUser',                                          \n" +
        "           'label': 'User',                                            \n" +
        "           'rangeURI': 'int',                                          \n" +
        "           'required': true,                                           \n" +
        "           'lookupSchema': 'core',                                     \n" +
        "           'lookupQuery': 'Principals'                                 \n" +
        "           },{                                                         \n" +
        "           'name': 'SNDAge',                                           \n" +
        "           'label': 'Age',                                             \n" +
        "           'rangeURI': 'double',                                       \n" +
        "           'format': '0.##',                                           \n" +
        "           'validators': [{                                            \n" +
        "               'name': 'SNDRange',                                     \n" +
        "               'description': 'This will check the range of the field',\n" +
        "               'type': 'range',                                        \n" +
        "               'expression': '~gte=1&amp;~lte=100',                    \n" +
        "               'errorMessage': 'No centenarians allowed'               \n" +
        "            }]                                                         \n" +
        "        }]                                                             \n" +
        "    }                                                                  \n" +
        "})";

    private static String SAVEPACKAGEAPI_CHILDREN = "LABKEY.Ajax.request({      \n" +
        "       method: 'POST',                                                 \n" +
        "		url: LABKEY.ActionURL.buildURL('snd', 'savePackage.api'),       \n" +
        "		success: function(){ callback('Success!'); },                   \n" +
        "		failure: function(e){ callback(e.responseText); },              \n" +
        "		jsonData: {                                                     \n" +
        "           'id' : '" + TEST_PKG_ID4 + "',                              \n" +
        "			'testIdNumberStart': '" + TEST_SUPER_PKG_START_ID1 + "',    \n" +
        "			'description': '" + TEST_SUPER_PKG_DESCRIPTION_1 + "',      \n" +
        "			'active': true,                                             \n" +
        "			'repeatable': true,                                         \n" +
        "			'narrative': 'This is a narrative2',                        \n" +
        "           'categories': ['" + TEST_CATEGORY_ID3 + "', '" + TEST_CATEGORY_ID4 + "'],\n" +
        "			'subPackages': [{                                           \n" +
        "				'superPkgId': 5150,                                     \n" +
        "				'sortOrder': 2,                                         \n" +
        "				'required': false                                       \n" +
        "			},{                                                         \n" +
        "				'superPkgId': 5200,                                     \n" +
        "				'sortOrder': 1,                                         \n" +
        "				'required': false                                       \n" +
        "			},{                                                         \n" +
        "				'superPkgId': 5250,                                     \n" +
        "				'sortOrder': 3,                                         \n" +
        "				'required': false                                       \n" +
        "			},{                                                         \n" +
        "				'superPkgId': 5150,                                     \n" +
        "				'sortOrder': 4,                                         \n" +
        "				'required': false                                       \n" +
        "			}],                                                         \n" +
        "			'extraFields': [{name:'UsdaCode', value:'B', rangeURI:'string'}],\n" +
        "			'attributes': [{                                            \n" +
        "				'name': 'SNDName',                                      \n" +
        "				'label': 'Name',                                        \n" +
        "				'rangeURI': 'string',                                   \n" +
        "				'required': false,                                      \n" +
        "				'scale': 500,                                           \n" +
        "				'sortOrder': 2,                                         \n" +
        "				'validators': [{                                        \n" +
        "					'name': 'SNDLength',                                \n" +
        "					'description': 'This will check the length of the field',\n" +
        "					'type': 'textlength',                                   \n" +
        "					'expression': '~gte=1&amp;~lte=400',                \n" +
        "					'errorMessage': 'This value must be between 1 and 400 characters long'\n" +
        "				}]                                                      \n" +
        "			},{                                                         \n" +
        "				'name': 'SNDUser',                                      \n" +
        "				'label': 'User',                                        \n" +
        "				'rangeURI': 'int',                                      \n" +
        "				'required': true,                                       \n" +
        "				'sortOrder': 1,                                         \n" +
        "				'lookupSchema': 'core',                                 \n" +
        "				'lookupQuery': 'Principals'                             \n" +
        "			},{                                                         \n" +
        "				'name': 'SNDAge',                                       \n" +
        "				'label': 'Age',                                         \n" +
        "				'rangeURI': 'double',                                   \n" +
        "				'sortOrder': 3,                                         \n" +
        "				'format': '0.##',                                       \n" +
        "				'validators': [{                                        \n" +
        "					'name': 'SNDRange',                                 \n" +
        "					'description': 'This will check the range of the field',\n" +
        "					'type': 'range',                                    \n" +
        "					'expression': '~gte=1&amp;~lte=100',                \n" +
        "					'errorMessage': 'No centenarians allowed'           \n" +
        "				}]                                                      \n" +
        "			}]                                                          \n" +
        "		}                                                               \n" +
        "	});";

    private static String UPDATESUPERPACKAGEAPI_CHILDREN = "LABKEY.Ajax.request({\n" +
        "		method: 'POST',                                                 \n" +
        "		url: LABKEY.ActionURL.buildURL('snd', 'savePackage.api'),       \n" +
        "		success: function(){ callback('Success!'); },\n" +
        "		failure: function(e){ callback(e.responseText); },              \n" +
        "		jsonData: {                                                     \n" +
        "           'id' : '" + TEST_PKG_ID4 + "',                              \n" +
        "			'testIdNumberStart': '" + TEST_SUPER_PKG_START_ID2 + "',    \n" +
        "			'description': '" + TEST_SUPER_PKG_DESCRIPTION_2 + "',      \n" +
        "			'active': true,                                             \n" +
        "			'repeatable': true,                                         \n" +
        "			'narrative': 'This is a narrative3',                        \n" +
        "           'categories': ['" + TEST_CATEGORY_ID3 + "', '" + TEST_CATEGORY_ID4 + "'],\n" +
        "			'subPackages': [{                                           \n" +
        "				'superPkgId': '" + (TEST_SUPER_PKG_START_ID1 + 2) + "', \n" +
        "				'sortOrder': 1,                                         \n" +
        "				'required': false                                       \n" +
        "			},{                                                         \n" +
        "				'superPkgId': '" + (TEST_SUPER_PKG_START_ID1 + 4) + "', \n" +
        "				'sortOrder': 2,                                         \n" +
        "				'required': false                                       \n" +
        "			},{                                                         \n" +
        "				'superPkgId': 5150,                                     \n" +
        "				'sortOrder': 4,                                         \n" +
        "				'required': false                                       \n" +
        "			},{                                                         \n" +
        "				'superPkgId': 5150,                                     \n" +
        "				'sortOrder': 6,                                         \n" +
        "				'required': false                                       \n" +
        "			},{                                                         \n" +
        "				'superPkgId': 5300,                                     \n" +
        "				'sortOrder': 3,                                         \n" +
        "				'required': false                                       \n" +
        "			},{                                                         \n" +
        "				'superPkgId': 5350,                                     \n" +
        "				'sortOrder': 5,                                         \n" +
        "				'required': false                                       \n" +
        "			}                                                           \n" +
        "			],                                                          \n" +
        "			'extraFields': [{name:'UsdaCode', value:'B', rangeURI:'string'}],\n" +
        "			'attributes': [{                                            \n" +
        "				'name': 'SNDName',                                      \n" +
        "				'label': 'Name',                                        \n" +
        "				'rangeURI': 'string',                                   \n" +
        "				'required': false,                                      \n" +
        "				'scale': 500,                                           \n" +
        "				'sortOrder': 2,                                         \n" +
        "				'validators': [{                                        \n" +
        "					'name': 'SNDLength',                                \n" +
        "					'description': 'This will check the length of the field',\n" +
        "					'type': 'textlength',                                   \n" +
        "					'expression': '~gte=1&amp;~lte=400',                \n" +
        "					'errorMessage': 'This value must be between 1 and 400 characters long'\n" +
        "				}]                                                      \n" +
        "			},{                                                         \n" +
        "				'name': 'SNDUser',                                      \n" +
        "				'label': 'User',                                        \n" +
        "				'rangeURI': 'int',                                      \n" +
        "				'required': true,                                       \n" +
        "				'sortOrder': 1,                                         \n" +
        "				'lookupSchema': 'core',                                 \n" +
        "				'lookupQuery': 'Principals'                             \n" +
        "			},{                                                         \n" +
        "				'name': 'SNDAge',                                       \n" +
        "				'label': 'Age',                                         \n" +
        "				'rangeURI': 'double',                                   \n" +
        "				'sortOrder': 3,                                         \n" +
        "				'format': '0.##',                                       \n" +
        "				'validators': [{                                        \n" +
        "					'name': 'SNDRange',                                 \n" +
        "					'description': 'This will check the range of the field',\n" +
        "					'type': 'range',                                    \n" +
        "					'expression': '~gte=1&amp;~lte=100',                \n" +
        "					'errorMessage': 'No centenarians allowed'           \n" +
        "				}]                                                      \n" +
        "			}]                                                          \n" +
        "		}                                                               \n" +
        "	});";

    private static String UPDATESUPERPACKAGEAPI_CLONE = "LABKEY.Ajax.request({      \n" +
            "		method: 'POST',                                                 \n" +
            "		url: LABKEY.ActionURL.buildURL('snd', 'savePackage.api'),       \n" +
            "		success: function(){ callback('Success!'); },                   \n" +
            "		failure: function(e){ callback(e.responseText); },              \n" +
            "		jsonData: {                                                     \n" +
            "			'clone': true,                                              \n" +
            "           'id' : '" + TEST_PKG_ID4 + "',                              \n" +
            "			'testIdNumberStart': '" + TEST_SUPER_PKG_START_ID3 + "',    \n" +
            "			'description': '" + TEST_SUPER_PKG_DESCRIPTION_3 + "',      \n" +
            "			'active': true,                                             \n" +
            "			'repeatable': true,                                         \n" +
            "			'narrative': 'This is a narrative4',                        \n" +
            "           'categories': ['" + TEST_CATEGORY_ID3 + "', '" + TEST_CATEGORY_ID4 + "'],\n" +
            "			'subPackages': [{                                           \n" +
            "				'superPkgId': '" + (TEST_SUPER_PKG_START_ID1 + 2) + "', \n" +
            "				'sortOrder': 1,                                         \n" +
            "				'required': false                                       \n" +
            "			},{                                                         \n" +
            "				'superPkgId': '" + (TEST_SUPER_PKG_START_ID1 + 4) + "', \n" +
            "				'sortOrder': 2,                                         \n" +
            "				'required': false                                       \n" +
            "			},{                                                         \n" +
            "				'superPkgId': 5150,                                     \n" +
            "				'sortOrder': 4,                                         \n" +
            "				'required': false                                       \n" +
            "			},{                                                         \n" +
            "				'superPkgId': 5150,                                     \n" +
            "				'sortOrder': 6,                                         \n" +
            "				'required': false                                       \n" +
            "			},{                                                         \n" +
            "				'superPkgId': 5300,                                     \n" +
            "				'sortOrder': 5,                                         \n" +
            "				'required': false                                       \n" +
            "			},{                                                         \n" +
            "				'superPkgId': 5400,                                     \n" +
            "				'sortOrder': 3,                                         \n" +
            "				'required': false                                       \n" +
            "			}                                                           \n" +
            "			],                                                          \n" +
            "			'extraFields': [{name:'UsdaCode', value:'B', rangeURI:'string'}],\n" +
            "			'attributes': [{                                            \n" +
            "				'name': 'SNDName',                                      \n" +
            "				'label': 'Name',                                        \n" +
            "				'rangeURI': 'string',                                   \n" +
            "				'required': false,                                      \n" +
            "				'scale': 500,                                           \n" +
            "				'sortOrder': 2,                                         \n" +
            "				'validators': [{                                        \n" +
            "					'name': 'SNDLength',                                \n" +
            "					'description': 'This will check the length of the field',\n" +
            "					'type': 'textlength',                                   \n" +
            "					'expression': '~gte=1&amp;~lte=400',                \n" +
            "					'errorMessage': 'This value must be between 1 and 400 characters long'\n" +
            "				}]                                                      \n" +
            "			},{                                                         \n" +
            "				'name': 'SNDUser',                                      \n" +
            "				'label': 'User',                                        \n" +
            "				'rangeURI': 'int',                                      \n" +
            "				'required': true,                                       \n" +
            "				'sortOrder': 1,                                         \n" +
            "				'lookupSchema': 'core',                                 \n" +
            "				'lookupQuery': 'Principals'                             \n" +
            "			},{                                                         \n" +
            "				'name': 'SNDAge',                                       \n" +
            "				'label': 'Age',                                         \n" +
            "				'rangeURI': 'double',                                   \n" +
            "				'sortOrder': 3,                                         \n" +
            "				'format': '0.##',                                       \n" +
            "				'validators': [{                                        \n" +
            "					'name': 'SNDRange',                                 \n" +
            "					'description': 'This will check the range of the field',\n" +
            "					'type': 'range',                                    \n" +
            "					'expression': '~gte=1&amp;~lte=100',                \n" +
            "					'errorMessage': 'No centenarians allowed'           \n" +
            "				}]                                                      \n" +
            "			}]                                                          \n" +
            "		}                                                               \n" +
            "	});";

    private static String UPDATESUPERPACKAGEAPI_NOCHILDREN = "LABKEY.Ajax.request({ \n" +
            "		method: 'POST',                                                 \n" +
            "		url: LABKEY.ActionURL.buildURL('snd', 'savePackage.api'),       \n" +
            "		success: function(){ callback('Success!'); },                   \n" +
            "		failure: function(e){ callback(e.responseText); },              \n" +
            "		jsonData: {                                                     \n" +
            "           'id' : '" + TEST_PKG_ID4 + "',                              \n" +
            "			'testIdNumberStart': '" + TEST_SUPER_PKG_START_ID4 + "',    \n" +
            "			'description': '" + TEST_SUPER_PKG_DESCRIPTION_4 + "',      \n" +
            "			'active': true,                                             \n" +
            "			'repeatable': true,                                         \n" +
            "			'narrative': 'This is a narrative5',                        \n" +
            "           'categories': ['" + TEST_CATEGORY_ID3 + "', '" + TEST_CATEGORY_ID4 + "'],\n" +
            "			'subPackages': [],                                          \n" +
            "			'extraFields': [{name:'UsdaCode', value:'B', rangeURI:'string'}],\n" +
            "			'attributes': [{                                            \n" +
            "				'name': 'SNDName',                                      \n" +
            "				'label': 'Name',                                        \n" +
            "				'rangeURI': 'string',                                   \n" +
            "				'required': false,                                      \n" +
            "				'scale': 500,                                           \n" +
            "				'sortOrder': 2,                                         \n" +
            "				'validators': [{                                        \n" +
            "					'name': 'SNDLength',                                \n" +
            "					'description': 'This will check the length of the field',\n" +
            "					'type': 'textlength',                                   \n" +
            "					'expression': '~gte=1&amp;~lte=400',                \n" +
            "					'errorMessage': 'This value must be between 1 and 400 characters long'\n" +
            "				}]                                                      \n" +
            "			},{                                                         \n" +
            "				'name': 'SNDUser',                                      \n" +
            "				'label': 'User',                                        \n" +
            "				'rangeURI': 'int',                                      \n" +
            "				'required': true,                                       \n" +
            "				'sortOrder': 1,                                         \n" +
            "				'lookupSchema': 'core',                                 \n" +
            "				'lookupQuery': 'Principals'                             \n" +
            "			},{                                                         \n" +
            "				'name': 'SNDAge',                                       \n" +
            "				'label': 'Age',                                         \n" +
            "				'rangeURI': 'double',                                   \n" +
            "				'sortOrder': 3,                                         \n" +
            "				'format': '0.##',                                       \n" +
            "				'validators': [{                                        \n" +
            "					'name': 'SNDRange',                                 \n" +
            "					'description': 'This will check the range of the field',\n" +
            "					'type': 'range',                                    \n" +
            "					'expression': '~gte=1&amp;~lte=100',                \n" +
            "					'errorMessage': 'No centenarians allowed'           \n" +
            "				}]                                                      \n" +
            "			}]                                                          \n" +
            "		}                                                               \n" +
            "	});";

    private static String getPackageWithId(String packageId)
    {
        return "LABKEY.Ajax.request({                                           \n" +
                "    method: 'POST',                                            \n" +
                "    url: LABKEY.ActionURL.buildURL('snd', 'getPackages.api'),  \n" +
                "    success: function(data, a, b, c, d){                       \n" +
                "       callback(JSON.parse(data.response).json[0]);\n" +
                "    },                                                         \n" +
                "    failure: function(e){ callback(e.responseText); },         \n" +
                "    jsonData: {'packages':['" + packageId + "']}               \n" +
                "});";
    }

    private static final String ADDEVENT = "LABKEY.Ajax.request({   \n" +
        "   method: 'POST',                                         \n" +
        "   url: LABKEY.ActionURL.buildURL('snd', 'saveEvent.api'), \n" +
        "   success: function(data){                                \n" +
        "       callback('Success!');                               \n" +
        "   },                                                      \n" +
        "   failure: function(e){                                   \n" +
        "       callback(e.exception); },                           \n" +
        "   jsonData: {                                             \n" +
        "       eventId: 1812345,                                   \n" +
        "       subjectId: '1',                                     \n" +
        "       qcState: 'Completed',                               \n" +
        "       note: 'This is a test event note.',                 \n" +
        "       projectIdRev: '" + PKG_TEST_PROJECT_ID + "|0',      \n" +
        "       eventData: [{                                       \n" +
        "           superPkgId: " + TEST_SUPER_PKG_START_ID5 + ",   \n" +
        "           sortOrder: 1,                                   \n" +
        "           extraFields: [],                                \n" +
        "           attributes: []                                  \n" +
        "       }]                                                  \n" +
        "   }                                                       \n" +
        "})                                                         \n";

    private static final String APISCRIPTS =
        "var container = '"+ PROJECTNAME +"';               \n"+
        "                                                   \n"+
        "function populateCategories() {                    \n"+
        "	LABKEY.Query.insertRows({                       \n"+
        "             containerPath: container,             \n"+
        "             schemaName: 'snd',                    \n"+
        "             queryName: 'PkgCategories',           \n"+
        "             rows: [{                              \n"+
        "				'CategoryId':  " + TEST_CATEGORY_ID1 + ",\n"+
        "				'Description':  'Surgery',          \n"+
        "				'Active': true,                     \n"+
        "				'Comment': 'This is a surgery'      \n"+
        "				},{                                 \n"+
        "				'CategoryId':  " + TEST_CATEGORY_ID2 + ",\n"+
        "				'Description':  'Blood Draw',       \n"+
        "				'Active': true,                     \n"+
        "				'Comment': 'This is a blood draw'   \n"+
        "				},{                                 \n"+
        "				'CategoryId':  " + TEST_CATEGORY_ID3+ ",\n"+
        "				'Description':  'Weight',           \n"+
        "				'Active': true,                     \n"+
        "				'Comment': 'This is a weight'       \n"+
        "				},{                                 \n"+
        "				'CategoryId':  " + TEST_CATEGORY_ID4 + ",\n"+
        "				'Description':  'Vitals',           \n"+
        "				'Active': true,                     \n"+
        "				'Comment': 'This is vitals'         \n"+
        "			}],                                     \n"+
        "			successCallback: function(data){        \n"+
        "				callback('Success!');               \n"+
        "			},                                      \n"+
        "			failureCallback: function(e){           \n"+
        "				callback(e.exception);              \n"+
        "			}                                       \n"+
        "	});                                             \n"+
        "}                                                  \n";

    private String createProjectApi(int id, String desc, int refId, String start, String end, String packages)
    {
        return "var id = " + id + ";\n" +
                "var desc = '" + desc + "';\n" +
                "var refId = " + refId + ";\n" +
                "var start = '" + start + "';\n" +
                "var end = '" + end + "';\n" +
                "var packages = " + packages + ";\n" +
                "var json = {\n" +
                "   \"projectId\": id,\n" +
                "   \"active\": true,\n" +
                "   \"description\": desc,\n" +
                "   \"referenceId\": refId,\n" +
                "   \"startDate\": start,\n" +
                "   \"projectItems\": packages\n" +
                "};\n" +
                "if (end != null && end != \"\") {\n" +
                "   json[\"endDate\"] = end;\n" +
                "}\n" +
                "if (packages != 'null' && packages != \"\") {\n" +
                "   if (packages === \"default\") {\n" +
                "       json[\"projectItems\"] = [{\"superPkgId\":" + TEST_IMPORT_SUPERPKG1 + ", \"active\":true}, {\"superPkgId\":" + TEST_IMPORT_SUPERPKG2 + ", \"active\":false}, {\"superPkgId\":" + TEST_IMPORT_SUPERPKG3 + ", \"active\":true}];\n" +
                "   }\n" +
                "   else {\n" +
                "       json[\"projectItems\"] = packages;\n" +
                "   }\n" +
                "}\n" +
                "json[\"extraFields\"] = [];\n" +
                "LABKEY.Ajax.request({\n" +
                "   method: 'POST',\n" +
                "   url: LABKEY.ActionURL.buildURL('snd', 'saveProject.api'),\n" +
                "   success: function(){ callback('Success!'); },\n" +
                "   failure: function(e){ callback('Failed'); },\n" +
                "   jsonData: json\n" +
                "});" +
                "\n";
    }

    private String editProjectApi(int id, int rev, String name, String value)
    {
        return "var id = " + id + ";\n" +
                "var rev = " + rev + ";\n" +
                "var name = '" + name + "';\n" +
                "var value = '" + value + "';\n" +
                "LABKEY.Ajax.request({\n" +
                "   method: 'POST',\n" +
                "   url: LABKEY.ActionURL.buildURL('snd', 'getProject.api'),\n" +
                "   failure: function(e){ callback(e.exception); },\n" +
                "   jsonData: {\n" +
                "       \"projectId\": id,\n" +
                "       \"revisionNum\": rev\n" +
                "   },\n" +
                "   success: function(data) {\n" +
                "       var json = JSON.parse(data.response).json;\n" +
                "       if (json === undefined || json[\"projectId\"] === undefined) {\n" +
                "           callback(\"Project Id not found\");\n" +
                "       }\n" +
                "       else {\n" +
                "           json[\"isEdit\"] = true;\n" +
                "           json[\"projectItems\"] = [{\"superPkgId\":" + TEST_IMPORT_SUPERPKG1 + ", \"active\":true}, {\"superPkgId\":" + TEST_IMPORT_SUPERPKG2 + ", \"active\":false}];\n" +
                "           try {\n" +
                "               json[name] = JSON.parse(value);\n" +
                "           }\n" +
                "           catch (e) {\n" +
                "               json[name] = value;\n" +
                "           }\n" +
                "           LABKEY.Ajax.request({\n" +
                "               method: 'POST',\n" +
                "               url: LABKEY.ActionURL.buildURL('snd', 'saveProject.api'),\n" +
                "               success: function(){ callback('Success!'); },\n" +
                "               failure: function(e){ callback('Failed'); },\n" +
                "               jsonData: json\t\t\n" +
                "           });\n" +
                "       }\n" +
                "   }\n" +
                "});\n";
    }

    private String reviseProjectApi(int id, int rev, String start, String end, String name, String value) throws java.text.ParseException
    {
        String dateFormat = "yyyy-MM-dd";
        SimpleDateFormat formatter = new SimpleDateFormat(dateFormat);
        Calendar c = Calendar.getInstance();
        c.setTime(formatter.parse(start));
        c.add(Calendar.DATE, -1);  // number of days to add
        String revisedEndDate = formatter.format(c.getTime());

        return "var id = " + id + ";\n" +
                "var rev = " + rev + ";\n" +
                "var start = '" + start + "';\n" +
                "var end = '" + end + "';\n" +
                "var name = '" + name + "';\n" +
                "var value = '" + value + "';\n" +
                "var revisedEndDate = '" + revisedEndDate + "';\n" +
                "LABKEY.Ajax.request({\n" +
                "   method: 'POST',\n" +
                "   url: LABKEY.ActionURL.buildURL('snd', 'getProject.api'),\n" +
                "   failure: function(e){ callback('Failed'); },\n" +
                "   jsonData: {\n" +
                "       \"projectId\": id,\n" +
                "       \"revisionNum\": rev\n" +
                "   },\n" +
                "   success: function(data) {\n" +
                "       var json = JSON.parse(data.response).json;\n" +
                "       if (json === undefined || json[\"projectId\"] === undefined) {\n" +
                "           callback(\"Project not found\");\n" +
                "       }\n" +
                "       else {\n" +
                "           if (end !== 'null') {\n" +
                "               json[\"endDate\"] = end;\n" +
                "           }\n" +
                "           else {\n" +
                "               json[\"endDate\"] = '';\n" +
                "           }\n" +
                "           json[\"startDate\"] = start;\n" +
                "           json[\"isRevision\"] = true;\n" +
                "           json[\"copyRevisedPkgs\"] = true;\n" +
                "           json[\"endDateRevised\"] = revisedEndDate;\n" +
                "           json[\"projectItems\"] = [];\n" +
                "           if (name !== 'null') {\n" +
                "               try {\n" +
                "                   json[name] = JSON.parse(value);\n" +
                "               }\n" +
                "               catch (e) {\n" +
                "                   json[name] = value;\n" +
                "               }\n" +
                "           }\n" +
                "           LABKEY.Ajax.request({\n" +
                "               method: 'POST',\n" +
                "               url: LABKEY.ActionURL.buildURL('snd', 'saveProject.api'),\n" +
                "               success: function(){ callback('Success!'); },\n" +
                "               failure: function(e){ callback('Failed'); },\n" +
                "               jsonData: json\t\t\n" +
                "           });\n" +
                "       }\n" +
                "   },\n" +
                "});\n";
    }

    private String deleteProjectApi(int id, int rev)
    {
        return "var id = " + id + ";\n" +
                "var rev = " + rev + ";\n" +
                "LABKEY.Query.selectRows({\n" +
                "   requiredVersion: 9.1,\n" +
                "   schemaName: \"snd\",\n" +
                "   queryName: \"Projects\",\n" +
                "   filterArray: [LABKEY.Filter.create(\"ProjectId\", id, LABKEY.Filter.Types.EQUAL), LABKEY.Filter.create(\"RevisionNum\", rev, LABKEY.Filter.Types.EQUAL)],\n" +
                "   success: function(data) {\n" +
                "       if (data.rowCount > 0) {\n" +
                "           LABKEY.Query.deleteRows({\n" +
                "               schemaName: 'snd',\n" +
                "               queryName: 'Projects',\n" +
                "               rows: [{'ObjectId': data.rows[0][\"ObjectId\"].value}],\n" +
                "               success: function(data){\n" +
                "                   callback('Success!');\n" +
                "               },\n" +
                "               failure: function(e){\n" +
                "                   callback('Failed');\n" +
                "               }\n" +
                "           });\n" +
                "       }\n" +
                "   },\n" +
                "   failure: function(e){\n" +
                "       callback('Failed');\n" +
                "   }\t\n" +
                "});\n";
    }

    private String createProjectEvent(int id, int rev)
    {
        return "function insert(schema, query, rows, success, failure) {\n" +
                "   LABKEY.Query.insertRows({\n" +
                "       schemaName: schema,\n" +
                "       queryName: query,\n" +
                "       rows: rows,\n" +
                "       successCallback: success,\n" +
                "       failureCallback: failure\n" +
                "   });\n" +
                "}\n\n" +
                "function insertIfNotExists(schema, query, key, keyVal, rows, success, failure) {\n" +
                "   LABKEY.Query.selectRows({\n" +
                "       requiredVersion: 9.1,\n" +
                "       schemaName: schema,\n" +
                "       queryName: query,\n" +
                "       filterArray: [LABKEY.Filter.create(key, parseInt(keyVal), LABKEY.Filter.Types.EQUAL)],\n" +
                "       success: function(data) {\n" +
                "           if(data.rows.length > 0) {\n" +
                "               success(data);\n" +
                "           }\n" +
                "           else {\n" +
                "               insert(schema, query, rows, success, failure);\n" +
                "           }\n" +
                "       },\n" +
                "       failure: failure\n" +
                "   });\n" +
                "}\n\n" +
                "var projectId = " + id + ";\n" +
                "var revNum = " + rev + ";\n" +
                "LABKEY.Query.selectRows({\n" +
                "   requiredVersion: 9.1,\n" +
                "   schemaName: \"snd\",\n" +
                "   queryName: \"Projects\",\n" +
                "   filterArray: [LABKEY.Filter.create(\"ProjectId\", projectId , LABKEY.Filter.Types.EQUAL), LABKEY.Filter.create(\"RevisionNum\", revNum, LABKEY.Filter.Types.EQUAL)],\n" +
                "   success: function(data) {\n" +
                "       if (data.rowCount > 0) {\n" +
                "           insertIfNotExists('snd', 'Events', 'EventId', projectId + revNum,\n" +
                "               [{\n" +
                "                   \"EventId\": projectId + revNum,\n" +
                "                   \"SubjectId\": 1,\n" +
                "                   \"Date\": new Date(),\n" +
                "                   \"ParentObjectId\": data.rows[0][\"ObjectId\"].value\n" +
                "               }],\n" +
                "               function(data){ //success\n" +
                "                   callback('Success!');\n" +
                "               },\n" +
                "               function(e){ //failure\n" +
                "                   callback('Failed');\n" +
                "               }\n" +
                "           );\n" +
                "       }\n" +
                "       else {\n" +
                "           callback(\"Project not found\");\n" +
                "       }\n" +
                "   },\n" +
                "   failure: function(e){\n" +
                "       callback('Failed');\n" +
                "   }\t\n" +
                "});\n";
    }

    // If entering a category with a user defined ID, the id will only be preserved if it is below 100.  If the id
    // is 100 or above it will be ignored and the identity column will auto increment.
    private String addCategoryScript(String container, String description, String comment, boolean active, int id)
    {
        String isActive = active ? "true":"false";
        return "LABKEY.Query.insertRows({                                               "+
                "             containerPath: "+container+",                             "+
                        "             schemaName: 'snd',                                "+
                        "             queryName: 'PkgCategories',                       "+
                        "             success: callback,                                "+
                        "             failure: callback,                                "+
                        "             rows: [{                                          "+
                        "				'CategoryId':  "+Integer.toString(id)+",        "+
                        "				'Description':  '"+description+"',              "+
                        "				'Active': "+ isActive   +",                     "+
                        "				'Comment': '"+comment+"'                        "+
                        "				}]);";
    }

    private static final String CREATECATEGORIESAPI = APISCRIPTS + " populateCategories();";

    private final Map<String, Object> TEST1ROW1MAP = Maps.of("PkgId", TEST_PKG_ID1, "Description", "Description 1", "ObjectId", "dbe961b9-b7ba-102d-8c2a-99223451b901", "testPkgs1", EXTCOLTESTDATA1);
    private final Map<String, Object> TEST1ROW2MAP = Maps.of("PkgId", TEST_PKG_ID2, "Description", "Description 2", "ObjectId", "dbe961b9-b7ba-102d-8c2a-99223751b901", "testPkgs1", EXTCOLTESTDATA2);
    private final Map<String, Object> TEST1ROW3MAP = Maps.of("PkgId", TEST_PKG_ID3, "Description", "Description 3", "ObjectId", "dbe961b9-b7ba-102d-8c2a-99223481b901", "testPkgs1", EXTCOLTESTDATA3);
    private final Map<String, Object> TEST1ROW3AMAP = Maps.of("PkgId", TEST_PKG_ID3, "Description", "Updated Description 3", "ObjectId", "dbe961b9-b7ba-102d-8c2a-99223481b901", "testPkgs1", EXTCOLTESTDATA3A);

    //Sample files for import to be used in this order
    private static final File IMPORT_FILES_DIR = TestFileUtils.getSampleData("snd/pipeline/import");
    private static final String INITIAL_IMPORT_FILE = "1_initial.snd.xml";
    private static final String CHANGE_NARRATIVE_FILE = "2_changeNarrative.snd.xml";
    private static final String INSERT_PACKAGE_FILE = "3_insertPackage.snd.xml";
    private static final String ADD_ATTRIBUTE_FILE = "4_addAttribute.snd.xml";
    private static final String REMOVE_ATTRIBUTE_FILE= "5_removeAttribute.snd.xml";
    private static final String REMOVE_ALL_ATTRIBUTES_FILE = "6_removeAllAttributes.snd.xml";

    private static final int IMPORT_WAIT_TIME = 30 * 1000;  // limit of 30 secs
    private int EXPECTED_IMPORT_JOBS = 1;

    @Override
    protected void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        _containerHelper.deleteProject(getProjectName(), afterTest);
    }

    // If values exist this will delete them.  Path of project folder must be valid.
    protected void deleteIfNeeded(String path, String schemaName, String queryName, Map<String, Object> map, String pkName) throws IOException, CommandException
    {
        Connection cn = createDefaultConnection(false);

        SelectRowsCommand selectCmd = new SelectRowsCommand(schemaName, queryName);
        selectCmd.addFilter(new Filter(pkName, map.get(pkName)));
        SelectRowsResponse srr = selectCmd.execute(cn, path);

        if (srr.getRowCount().intValue() > 0)
        {
            DeleteRowsCommand deleteCmd = new DeleteRowsCommand(schemaName, queryName);
            deleteCmd.addRow(map);
            deleteCmd.execute(cn, path);
        }
    }

    @Override
    public void checkLinks()
    {
        if ( TestProperties.isLinkCheckEnabled() )
            log("Permissions on related modules prevent effectively crawling links. Skipping crawl.");
    }

    @BeforeClass
    public static void setupProject()
    {
         SNDTest init = (SNDTest) getCurrentTest();

         init.doSetup();
    }

    private void doSetup()
    {
        _containerHelper.createProject(getProjectName(), "Collaboration");
        goToProjectHome();
        _containerHelper.enableModules(Arrays.asList("SND"));
        _containerHelper.createSubfolder(getProjectName(), getProjectName(), TEST1SUBFOLDER, "Collaboration", new String[]{"SND"});
        setupTest1Project();

        //insert package categories
        runScript(CREATECATEGORIESAPI);
        populateLookups();
        populateQCStates();

        initPermissions();

        // These will run as part of project setup to populate data
        testSNDImport();
        testPackageApis();
    }

    private void setupTest1Project()
    {
        clickFolder(TEST1SUBFOLDER);
        runScript(CREATEDOMAINSAPI);
    }

    private void populateQCStates()
    {
        beginAt(buildURL("snd", PROJECTNAME, "admin"));

        click(Locator.linkContainingText("Populate QC States"));
        waitForText("QC states inserted");
        sleep(3000);
        Locator closeButton = Locator.tagWithClass("button", "close")
                .withAttribute("data-dismiss", "modal");
        waitAndClick(closeButton);
    }

    private void setRole(int groupId, int categoryId, String role)
    {
        beginAt(buildURL("snd", PROJECTNAME, "security"));

        setFormElementJS(Locator.inputById(groupId + "_" + categoryId), role);

        clickButton("Save");
        waitForText("Security");
    }

    private void initPermissions()
    {
        ApiPermissionsHelper _permissionsHelper = new ApiPermissionsHelper(this);

        int groupId = _permissionsHelper.createProjectGroup("SNDApiTestGroup", getProjectName());
        _permissionsHelper.addUserToProjGroup(getCurrentUser(), PROJECTNAME, "SNDApiTestGroup");

        setRole(groupId, TEST_CATEGORY_ID3, "SND Data Admin");
    }

    private void runScript(String script)
    {
        String result = (String) executeAsyncScript(script);
        assertEquals("JavaScript API failure.", "Success!", result);
    }

    private void runScriptExpectedFail(String script)
    {
        //TODO: Once error handling refactored we should pass in the expected error message and assert that.
        String result = (String) executeAsyncScript(script);
        assertEquals("JavaScript API error condition failure.", "Failed", result);
    }

    private void populateLookups()
    {
        Connection connection = createDefaultConnection(true);
        CommandResponse resp;

        InsertRowsCommand command = new InsertRowsCommand("snd", "LookupSets");
        List<Map<String, Object>> lookupSetRows = Arrays.asList(
                new HashMap<String, Object>(Maps.of("SetName", "SurgeryType",
                        "Label", "Surgery Type",
                        "Description", "These are surgery types",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<String, Object>(Maps.of("SetName", "BloodDrawType",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<String, Object>(Maps.of("SetName", "GenderType",
                        "Label", "Gender",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<String, Object>(Maps.of("SetName", "VolumeUnitTypes",
                        "Label", "Volume",
                        "Description", "Units of volume",
                        "ObjectId", UUID.randomUUID().toString())));

        command.setRows(lookupSetRows);

        try
        {
            resp = command.execute(connection, getProjectName());
        }
        catch (IOException | CommandException e)
        {
            throw new RuntimeException(e);
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>)resp.getParsedData().get("rows");
        List<Map<String, Object>> lookupRows = Arrays.asList(
                new HashMap<>(Maps.of("LookupSetId", data.get(0).get("lookupSetId"),
                        "Value", "Research",
                        "Displayable", "true",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<>(Maps.of("LookupSetId", data.get(0).get("lookupSetId"),
                        "Value", "Clinical",
                        "Displayable", "true",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<>(Maps.of("LookupSetId", data.get(1).get("lookupSetId"),
                        "Value", "Research Blood Draw",
                        "Displayable", "true",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<>(Maps.of("LookupSetId", data.get(1).get("lookupSetId"),
                        "Value", "Clinical Blood Draw",
                        "Displayable", "true",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<>(Maps.of("LookupSetId", data.get(2).get("lookupSetId"),
                        "Value", "Male",
                        "Displayable", "true",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<>(Maps.of("LookupSetId", data.get(2).get("lookupSetId"),
                        "Value", "Female",
                        "Displayable", "true",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<>(Maps.of("LookupSetId", data.get(3).get("lookupSetId"),
                        "Value", "mL",
                        "Displayable", "true",
                        "ObjectId", UUID.randomUUID().toString())),
                new HashMap<>(Maps.of("LookupSetId", data.get(3).get("lookupSetId"),
                        "Value", "L",
                        "Displayable", "true",
                        "ObjectId", UUID.randomUUID().toString())));

        command = new InsertRowsCommand("snd", "Lookups");
        command.setRows(lookupRows);

        try
        {
            command.execute(connection, getProjectName());
        }
        catch (IOException | CommandException e)
        {
            throw new RuntimeException(e);
        }
    }

    @Before
    public void preTest()
    {
        goToProjectHome();
//        truncateSndPkg();

        //TODO: once exp tables are exposed - do a full cleanup from snd.pkgs, exp.DomainDescriptor, exp.PropertyDomain, exp.PropertyDescriptor
    }

    public void testSNDImport()
    {
        //go to SND Project
        clickProject(PROJECTNAME);

        WebDavUploadHelper uploadHelper = new WebDavUploadHelper(getProjectName());
        uploadHelper.setFileFilter(file -> file.getName().endsWith(".xml"));
        uploadHelper.uploadDirectoryContents(IMPORT_FILES_DIR);

        //go to Pipeline module
        goToModule("Pipeline");

        //import 1_initial.snd.xml
        clickButton("Process and Import Data", defaultWaitForPage);
        _fileBrowserHelper.checkFileBrowserFileCheckbox(INITIAL_IMPORT_FILE);
        _fileBrowserHelper.selectImportDataAction("SND document import");
        waitForPipelineJobsToComplete(EXPECTED_IMPORT_JOBS, "SND Import ("+INITIAL_IMPORT_FILE+")", false, IMPORT_WAIT_TIME);

        //go to grid view for snd.pkg
        goToSchemaBrowser();
        selectQuery("snd", "Pkgs");
        waitAndClickAndWait(Locator.linkWithText("view data"));

        DataRegionTable results = new DataRegionTable("query", getDriver());
        assertTrue("Expect the package we registered in this test to be there",
                results.getColumnDataAsText("Description").contains("Vitals"));

        List<List<String>> rows = results.getRows("PkgId", "Description", "Active", "Repeatable", "Narrative");
        List<String> row_expected = Arrays.asList("878", "Vitals", "true", "true", "Check Vitals Test");
        assertEquals("Initial package insert - data not as expected in snd.Pkgs", row_expected, rows.get(0));

        //TODO: Uncomment below and test for validity - I was unable to test since these tables are not exposed yet
//        //DomainDescriptor
//        Connection conn = WebTestHelper.getRemoteApiConnection();
//        SelectRowsCommand selectFromDomainDescriptor = new SelectRowsCommand("exp", "DomainDescriptor");
//        selectFromDomainDescriptor.addFilter(new Filter("Name", "Package-1", Filter.Operator.EQUAL));
//        SelectRowsResponse resp = selectFromDomainDescriptor.execute(conn, getContainerPath());
//        assertEquals("exp.DomainDescriptor does not contain a row where Name equals Package-1", 1, resp.getRows().size());
//
//        Map<String, Object> domainDescriptorRow = resp.getRows().get(0);
//        int domainId = (int) domainDescriptorRow.get("DomainId");
//
//        //PropertyDomain
//        SelectRowsCommand selectFromPropertyDomain = new SelectRowsCommand("exp", "PropertyDomain");
//        selectFromPropertyDomain.addFilter(new Filter("DomainId", domainId, Filter.Operator.EQUAL));
//        resp = selectFromPropertyDomain.execute(conn, getContainerPath());
//        assertEquals("exp.PropertyDomain does not contain a row with expected DomainId " + domainId, 1, resp.getRows().size());
//
//        Map<String, Object> propertyDomain= resp.getRows().get(0);
//        int propertyId = (int) propertyDomain.get("PropertyId");
//
//        //PropertyDescriptor
//        SelectRowsCommand selectFromPropertyDescriptor = new SelectRowsCommand("exp", "PropertyDescriptor");
//        selectFromPropertyDescriptor.addFilter(new Filter("PropertyId", propertyId, Filter.Operator.EQUAL));
//        resp = selectFromPropertyDescriptor.execute(conn, getContainerPath());
//        assertEquals("exp.PropertyDescriptor does not contain a row with expected Propertyid " + propertyId, 1, resp.getRows().size());

        //import 2_changeNarrative.snd.xml
        goToModule("Pipeline");
        clickButton("Process and Import Data", defaultWaitForPage);
        _fileBrowserHelper.checkFileBrowserFileCheckbox(CHANGE_NARRATIVE_FILE);
        _fileBrowserHelper.selectImportDataAction("SND document import");
        waitForPipelineJobsToComplete(++EXPECTED_IMPORT_JOBS, "SND Import ("+CHANGE_NARRATIVE_FILE+")", false, IMPORT_WAIT_TIME);

        //go to grid view
        goToSchemaBrowser();
        selectQuery("snd", "Pkgs");
        waitAndClickAndWait(Locator.linkWithText("view data"));

        results = new DataRegionTable("query", getDriver());
        rows = results.getRows("PkgId", "Description", "Active", "Repeatable", "Narrative");
        row_expected = Arrays.asList("878", "Vitals", "true", "true", "Check Vitals");
        assertEquals("Updated narrative - data not as expected in snd.Pkgs", row_expected, rows.get(0));

        //import 3_insertPackage.snd.xml
        goToModule("Pipeline");
        clickButton("Process and Import Data", defaultWaitForPage);
        _fileBrowserHelper.checkFileBrowserFileCheckbox(INSERT_PACKAGE_FILE);
        _fileBrowserHelper.selectImportDataAction("SND document import");
        waitForPipelineJobsToComplete(++EXPECTED_IMPORT_JOBS, "SND Import ("+INSERT_PACKAGE_FILE+")", false, IMPORT_WAIT_TIME);

        // go to grid view
        goToSchemaBrowser();
        selectQuery("snd", "Pkgs");
        waitAndClickAndWait(Locator.linkWithText("view data"));

        results = new DataRegionTable("query", getDriver());
        //assertEquals("Wrong row count in snd.Pkgs",2, results.getDataRowCount()); //todo: better test for rows that should and should not be present

        rows = results.getRows("PkgId", "Description", "Active", "Repeatable", "Narrative");
        row_expected = Arrays.asList("877", "Therapy", "false", "true", "Therapy started");
        assertEquals("New Package inserted - data not as expected in snd.Pkgs", row_expected, rows.get(0));

        //import 4_addAttribute.snd.xml
        goToModule("Pipeline");
        clickButton("Process and Import Data", defaultWaitForPage);
        _fileBrowserHelper.checkFileBrowserFileCheckbox(ADD_ATTRIBUTE_FILE);
        _fileBrowserHelper.selectImportDataAction("SND document import");
        waitForPipelineJobsToComplete(++EXPECTED_IMPORT_JOBS, "SND Import ("+ADD_ATTRIBUTE_FILE+")", false, IMPORT_WAIT_TIME);

        //go to grid view
        //TODO: Test attribute addition in exp tables (not exposed yet)

        //import 5_removeAttribute.snd.xml
        goToModule("Pipeline");
        clickButton("Process and Import Data", defaultWaitForPage);
        _fileBrowserHelper.checkFileBrowserFileCheckbox(REMOVE_ATTRIBUTE_FILE);
        _fileBrowserHelper.selectImportDataAction("SND document import");
        waitForPipelineJobsToComplete(++EXPECTED_IMPORT_JOBS, "SND Import ("+REMOVE_ATTRIBUTE_FILE+")", false, IMPORT_WAIT_TIME);

        //go to grid view
        //TODO: Test attribute removal in exp tables (not exposed yet)

        //import 6_removeAllAttributes.snd.xml
        goToModule("Pipeline");
        clickButton("Process and Import Data", defaultWaitForPage);
        _fileBrowserHelper.checkFileBrowserFileCheckbox(REMOVE_ALL_ATTRIBUTES_FILE);
        _fileBrowserHelper.selectImportDataAction("SND document import");
        waitForPipelineJobsToComplete(++EXPECTED_IMPORT_JOBS, "SND Import ("+REMOVE_ALL_ATTRIBUTES_FILE+")", true, IMPORT_WAIT_TIME);

        checkExpectedErrors(1);
    }

    @Test
    @Ignore
    public void submitDraftPackageForReview()
    {
        String description = "Our first package draft. Ambitious!";
        String narrative = "Shall I {compare} thee to a summer's day?" +
                "{Thou} art more lovely, and more {temperate};" +
                "Rough {winds} do shake the {darling} buds of May," +
                "And summer's {lease} hath all too short a date";
        PackageListPage listPage = PackageListPage.beginAt(this, getProjectName());
        EditPackagePage editPage = listPage.clickNewPackage();
        editPage.setDescription(description);
        editPage.setNarrative(narrative);

        AttributesGrid grid = editPage.getAttributesGrid();
        grid.waitForRows(6);

        // now edit a row
        AttributeGridRow windsRow = grid.getRow("winds")
                .setDataType("String")
                .setLabel("blustery")
                .setMin(2)
                .setMax(7)
                .setDefault("breeze")
                .setRequired(true)
                .setRedactedText("lol");

        listPage = editPage.clickSaveAsDraft();
        listPage.showDrafts(true);
        listPage.setSearchFilter(description);
        PackageViewerResult packageViewerResult = listPage.getPackage(description);

        EditPackagePage reviewPage = packageViewerResult.clickEdit();
        assertEquals("narrative should equal what we set" ,narrative, reviewPage.getNarrative());
        assertEquals("description should equal what we set" ,description, reviewPage.getDescription());
        reviewPage.clickSubmitForReview();
    }

    @Test
    public void cloneDraftPackage()
    {
        String description = "more sonnets. Ambitious!";
        String cloneDescription = "clone of more sonnets narrative.  Ugh, derivative!";
        String narrative = "Sometimes too hot the {eye} of heaven shines" +
                "and often is is {gold} complexion dimm'd, " +
                "and every {fair} from {fair2} sometime declines, " +
                "by chance, or nature's changing {course} untrimmed";
        PackageListPage listPage = PackageListPage.beginAt(this, getProjectName());
        EditPackagePage editPage = listPage.clickNewPackage();
        editPage.setDescription(description);
        editPage.setNarrative(narrative);

        AttributesGrid grid = editPage.getAttributesGrid();
        grid.waitForRows(5);

        // now edit a row
        AttributeGridRow fairRow = grid.getRow("fair")
                .setDataType("String")
                .setLabel("appearance")
                .setMin(2)
                .setMax(7)
                .setDefault(":-)")
                .setRequired(true)
                .setRedactedText("lol");

        listPage = editPage.clickSaveAsDraft();
        listPage.showDrafts(true);
        listPage.setSearchFilter(description);
        PackageViewerResult packageViewerResult = listPage.getPackage(description);

        EditPackagePage reviewPage = packageViewerResult.clickClone();
        assertEquals("narrative should equal what we set" ,narrative, reviewPage.getNarrative());
        assertEquals("description should equal what we set" ,description, reviewPage.getDescription());
        listPage = reviewPage.setDescription(cloneDescription)
                .setNarrative(narrative + "But thy eternal summer shall not fade, nor lose possession of that fair thou ow'st" +
                        "when in eternal lines to time thou grow'st," +
                        "so long as men can breathe or eyes can see, " +
                        "so long lives this, and this gives life to thee.")
                .clickSaveAsDraft();

        // now validate
        listPage.setSearchFilter("clone of more sonnets narrative")
                .showDrafts(true);
        PackageViewerResult newClonedPackage = listPage.getPackage(cloneDescription);
        EditPackagePage cloneReviewPage = newClonedPackage.clickView();

        // confirm the cloned package has the same values in the 'fair' row
        AttributeGridRow fairReviewRow = cloneReviewPage.getAttributesGrid().getRow("fair");
        assertEquals("String", fairReviewRow.getDataType());
        assertEquals("appearance", fairReviewRow.getLabel());
        assertEquals("2", fairReviewRow.getMin());
        assertEquals("7", fairReviewRow.getMax());
        assertEquals(":-)", fairReviewRow.getDefault());
        assertEquals(true, fairReviewRow.getRequired());
        assertEquals("lol", fairReviewRow.getRedactedText());
    }

    @Test
    public void assignPackageToNewPackage()
    {
        String description = "Our latest package. Has Vitals! And Therapy!";    // todo: don't rely on vitals and therapy being already there;
                                                                                // the test should handle its own dependencies and not count on other test cases
        String narrative = "When, in the course of human events, it becomes necessary for one people to" +
                " {dissolve} the political bonds which have {connected} them with another, " +
                "and to assume among the powers of the {earth}...";
        PackageListPage listPage = PackageListPage.beginAt(this , getProjectName());

        EditPackagePage editPage = listPage.clickNewPackage();
        FilterSelect categoriesSelect = editPage.getCategoriesSelect();
        categoriesSelect
                .selectItem("Surgery")
                .selectItem("Blood Draw")
                .close();

        editPage.setDescription(description);
        editPage.setNarrative(narrative);

        AttributesGrid grid = editPage.getAttributesGrid();
        grid.waitForRows(3);

        // now edit a row
        AttributeGridRow earthRow = grid.getRow("earth")
                .setDataType("String")
                .selectLookupKey("Volume")
                .setLabel("Terra")
                .setMin(2)
                .setMax(7)
                .setDefaultLookup("mL")
                .setRequired(true)
                .setRedactedText("and rocks");

        // add the 'vitals' and 'therapy' packages
        editPage.getAvailablePackage("Vitals")
                .clickMenuItem("Add");
        editPage.getAvailablePackage("Therapy")
                .clickMenuItem("Add");
        String vitalsNarrative = editPage.getAssignedPackageText("Vitals");
        String therapyNarrative = editPage.getAssignedPackageText("Therapy");
        assertEquals("incorrect narrative text from the UI","Check Vitals", vitalsNarrative);
        assertEquals("incorrect narrative text from the UI","Therapy started", therapyNarrative);

        listPage = editPage.clickSave();
        listPage.setSearchFilter(description);
        PackageViewerResult packageViewerResult = listPage.getPackage(description);

        EditPackagePage viewPage = packageViewerResult.clickEdit();
        assertEquals("narrative should equal what we set" ,narrative, viewPage.getNarrative());
        assertEquals("description should equal what we set" ,description, viewPage.getDescription());

        List<String> selectedCategories = viewPage.getCategoriesSelect().getSelections();
        assertTrue("Expect Blood Draw category", selectedCategories.stream().anyMatch((a)-> a.contains("Blood Draw")));
        assertTrue("Expect Surgery category", selectedCategories.stream().anyMatch((a)-> a.contains("Surgery")));

        // and verify the narrative attributes we set
        AttributeGridRow verifyEarthRow = grid.getRow("earth");
        assertEquals("String", verifyEarthRow.getDataType());
        assertEquals("Volume", verifyEarthRow.getLookupKey());
        assertEquals("Terra", verifyEarthRow.getLabel());
        assertEquals("2", verifyEarthRow.getMin());
        assertEquals("7", verifyEarthRow.getMax());
        assertEquals("mL", verifyEarthRow.getDefaultLookup());
        assertEquals("and rocks", verifyEarthRow.getRedactedText());

        listPage = editPage.clickCancel();
        listPage.setSearchFilter("Vitals");
        packageViewerResult = listPage.getPackage("Vitals");
        editPage = packageViewerResult.clickEdit();

        grid = editPage.getAttributesGrid();
        grid.waitForRows(2);

        AttributeGridRow vitalRow = grid.getRow("vital3");
        assertEquals("Decimal", vitalRow.getDataType());
        assertEquals("Vital 3", vitalRow.getLabel());
        assertEquals("0", vitalRow.getMin());
        assertEquals("10", vitalRow.getMax());
        assertEquals("5.25", vitalRow.getDefault());
    }

    @Test
    public void saveNewPackage()
    {
        String description = "Our first package. Adorable!";
        String narrative = "Four {score} and seven {years} ago, our {forefathers} brought forth," +
                " upon this {continent}, a new {nation}, conceived in liberty, " +
                "and dedicated to the proposition that all {men} are created equal.";
        PackageListPage listPage = PackageListPage.beginAt(this , getProjectName());

        EditPackagePage editPage = listPage.clickNewPackage();
        FilterSelect categoriesSelect = editPage.getCategoriesSelect();
        categoriesSelect
                .selectItem("Surgery")
                .selectItem("Blood Draw")
                .close();

        editPage.setDescription(description);
        editPage.setNarrative(narrative);

        AttributesGrid grid = editPage.getAttributesGrid();
        grid.waitForRows(6);

        // now edit a row
        AttributeGridRow menRow = grid.getRow("men")
                .setDataType("String")
                .setLabel("gender-generic term")
                .setMin(2)
                .setMax(7)
                .setDefault("men")
                .setRequired(true)
                .setRedactedText("and women");
        // move a row Up
        AttributeGridRow nationRow = grid.getRow("nation")
                .selectOrder("Move Down");

        listPage = editPage.clickSave();
        listPage.setSearchFilter(description);
        PackageViewerResult packageViewerResult = listPage.getPackage(description);

        EditPackagePage viewPage = packageViewerResult.clickView();
        assertEquals("narrative should equal what we set" ,narrative, viewPage.getNarrative());
        assertEquals("description should equal what we set" ,description, viewPage.getDescription());

        List<String> selectedCategories = viewPage.getCategoriesSelect().getSelections();
        assertTrue("Expect Blood Draw category", selectedCategories.stream().anyMatch((a)-> a.contains("Blood Draw")));
        assertTrue("Expect Surgery category", selectedCategories.stream().anyMatch((a)-> a.contains("Surgery")));

        // confirm the package has the same values we set
        AttributeGridRow reviewRow = viewPage.getAttributesGrid().getRow("men");
        assertEquals("String", reviewRow.getDataType());
        assertEquals("gender-generic term", reviewRow.getLabel());
        assertEquals("2", reviewRow.getMin());
        assertEquals("7", reviewRow.getMax());
        assertEquals("men", reviewRow.getDefault());
        assertEquals(true, reviewRow.getRequired());
        assertEquals("and women", reviewRow.getRedactedText());
    }

    @Test
    public void removeAssignedPackage()
    {
        String description = "Our latest package. From Canterbury!";
        String narrative = "WHAN that Aprille with his shoures {soote} " +  // prologue to the canterbury tales, yo
                "The droghte 2 of Marche hath perced to the {roote}, " +
                "And bathed every veyne in swich {licour}, " +
                "Of which vertu engendred is the {flour}; [...]";
        PackageListPage listPage = PackageListPage.beginAt(this , getProjectName());

        EditPackagePage editPage = listPage.clickNewPackage();

        editPage.setDescription(description);
        editPage.setNarrative(narrative);

        AttributesGrid grid = editPage.getAttributesGrid();
        grid.waitForRows(4);

        // now edit a row
        AttributeGridRow rootRow = grid.getRow("roote")
                .setDataType("String")
                .selectLookupKey("Volume")
                .setLabel("as it sounds")
                .setMin(2)
                .setMax(7)
                .setDefaultLookup("mL")
                .setRequired(true)
                .setRedactedText("radishes");

        listPage = editPage.clickSave();
        listPage.setSearchFilter(description);
        PackageViewerResult packageViewerResult = listPage.getPackage(description);

        // now create another package, add the first one to it
        String canterburySuperPackageDescription = "The latest! With more yeomen and ploughmen!";
        String canterburySuperPackageNarrative = "Than longen folk to goon on pilgrimages, " +
                "And palmers for to seken {straunge} strondes";
        editPage = listPage.clickNewPackage();
        editPage.setNarrative(canterburySuperPackageNarrative);
        editPage.setDescription(canterburySuperPackageDescription);
        editPage.getAvailablePackage(description).clickMenuItem("Add");
        sleep(1000);
        listPage = editPage.clickSave();

        // then remove it
        editPage = listPage.getPackage(canterburySuperPackageDescription).clickEdit();
        editPage.getAssignedPackage(description).clickMenuItem("Remove");
        listPage = editPage.clickSave();

        EditPackagePage viewPage = listPage.getPackage(canterburySuperPackageDescription).clickView();

        List<SuperPackageRow> assignedPackages = viewPage.getAssignedPackages();
        assertFalse("Don't expect to see Canterbury package assigned to the current package",
                assignedPackages
                        .stream()
                        .anyMatch((a)-> a.getLabel().contains(description)));
    }

    @Test
    public void addCategoryViaUI() throws Exception
    {
        String ourNewCategory = "a test category, created via the UI";
        PackageListPage listPage = PackageListPage.beginAt(this , getProjectName());
        EditCategoriesPage catPage = listPage.clickEditCategories();

        // create a new one via the UI
        catPage.addCategory(ourNewCategory, true);
        catPage = catPage.clickSave();
        waitFor(()-> false, 2000);

        SelectRowsCommand catsCmd = new SelectRowsCommand("snd", "PkgCategories");
        SelectRowsResponse afterCats = catsCmd.execute(createDefaultConnection(false), getProjectName());

        assertTrue("our category should have been created, but was not",
                afterCats.getRows().stream().anyMatch((a)-> a.get("Description").equals(ourNewCategory)));
    }

    @Test
    public void deleteCategoryViaUI() throws Exception
    {
        // insert the category via API
        String ourCategory = "a category to be deleted for test purposes";
        InsertRowsCommand cmd = new InsertRowsCommand("snd", "PkgCategories");
        Map<String, Object> catMap = new HashMap<>();
        catMap.put("Description", ourCategory);
        catMap.put("Active", true);
        catMap.put("Comment", "delete me");
        cmd.addRow(catMap);
        SaveRowsResponse response = cmd.execute(createDefaultConnection(false), getProjectName());

        PackageListPage listPage = PackageListPage.beginAt(this , getProjectName());
        EditCategoriesPage catPage = listPage.clickEditCategories();

        // after clicking 'save' we expect to have to dismiss the dialog for deleting the 'weight' category

        catPage.deleteCategory(ourCategory);
        catPage.clickSave();
        ModalDialog.finder(getDriver())
                .withBodyTextContaining("Are you sure you want to delete row").find()
                .dismiss("Submit Changes");
        waitFor(()-> false, 2000);

        SelectRowsCommand catsCmd = new SelectRowsCommand("snd", "PkgCategories");
        SelectRowsResponse afterCats = catsCmd.execute(createDefaultConnection(false), getProjectName());

        assertFalse("our category should have been deleted, but was not",
                afterCats.getRows().stream().anyMatch((a)-> a.get("Description").equals(ourCategory)));
    }


    @Test
    public void editCategories() throws Exception
    {
        String ourCategory = "a category to be edited for test purposes";
        String editedCategory = "a category that has been edited for test purposes";
        InsertRowsCommand cmd = new InsertRowsCommand("snd", "PkgCategories");
        Map<String, Object> catMap = new HashMap<>();
        catMap.put("Description", ourCategory);
        catMap.put("Active", true);
        catMap.put("Comment", "edit me so hard!"); // comment is not shown in the UI
        cmd.addRow(catMap);
        SaveRowsResponse response = cmd.execute(createDefaultConnection(false), getProjectName());
        assertEquals(200, response.getStatusCode());

        PackageListPage listPage = PackageListPage.beginAt(this , getProjectName());

        EditCategoriesPage catPage = listPage.clickEditCategories();

        // edit an existing one
        CategoryEditRow editRow = CategoryEditRow.finder(getDriver()).withDescription(ourCategory).timeout(5000).find();
        editRow.setActive(false)
                .setDescription(editedCategory);
        catPage = catPage.clickSave();
        sleep(2000);

        CategoryEditRow surgeryRowCat = catPage.getCategory("Surgery");
        assertNotNull("Surgery category should exist", surgeryRowCat);
        assertEquals("Surgery category should be active", true, surgeryRowCat.getIsActive());

        CategoryEditRow ourCat = catPage.getCategory(editedCategory);
        assertNotNull("test edit category should exist", ourCat);
        assertEquals("test edit category should be inactive", false, ourCat.getIsActive());
        assertEquals("test edit category should have new description", editedCategory, ourCat.getDescription());

        SelectRowsCommand catsCmd = new SelectRowsCommand("snd", "PkgCategories");
        SelectRowsResponse afterCats = catsCmd.execute(createDefaultConnection(false), getProjectName());
        assertTrue("our category should have been edited, but was not",
                afterCats.getRows().stream().anyMatch((a)-> a.get("Description").equals(editedCategory)));
        assertFalse("our category should have been edited, but was not",
                afterCats.getRows().stream().anyMatch((a)-> a.get("Description").equals(ourCategory)));
    }

    @Test
    public void testExtensibleColumns() throws Exception
    {
        clickFolder(TEST1SUBFOLDER);

        Connection cn = createDefaultConnection(false);

        InsertRowsCommand insertRowsCommand = new InsertRowsCommand("snd", "Pkgs");
        insertRowsCommand.addRow(TEST1ROW1MAP);
        insertRowsCommand.addRow(TEST1ROW2MAP);
        insertRowsCommand.addRow(TEST1ROW3MAP);
        SaveRowsResponse resp = insertRowsCommand.execute(cn, getProjectName() + "/" + TEST1SUBFOLDER);
        assertEquals(resp.getRowsAffected().intValue(), 3);

        goToSchemaBrowser();
        selectQuery("snd", "Pkgs");
        assertTextPresent(PKGSTESTCOL);
        waitAndClickAndWait(Locator.linkWithText("view data"));

        CustomizeView customizeViewHelper = new CustomizeView(this);

        customizeViewHelper.openCustomizeViewPanel();
        customizeViewHelper.addColumn("testPkgs1");
        customizeViewHelper.applyCustomView();

        assertTextPresent(EXTCOLTESTDATA1, EXTCOLTESTDATA2, EXTCOLTESTDATA3);

        clickFolder(TEST1SUBFOLDER);

        UpdateRowsCommand updateRowsCommand = new UpdateRowsCommand("snd", "Pkgs");
        updateRowsCommand.addRow(TEST1ROW3AMAP);
        resp = updateRowsCommand.execute(cn, getProjectName() + "/" + TEST1SUBFOLDER);
        assertEquals(resp.getRowsAffected().intValue(), 1);

        goToSchemaBrowser();
        selectQuery("snd", "Pkgs");
        waitAndClickAndWait(Locator.linkWithText("view data"));
        assertTextPresent(EXTCOLTESTDATA1, EXTCOLTESTDATA2, EXTCOLTESTDATA3A, "Updated Description 3");

        clickFolder(TEST1SUBFOLDER);

        DeleteRowsCommand deleteRowsCommand = new DeleteRowsCommand("snd", "Pkgs");
        deleteRowsCommand.addRow(TEST1ROW2MAP);
        resp = deleteRowsCommand.execute(cn, getProjectName() + "/" + TEST1SUBFOLDER);
        assertEquals(resp.getRowsAffected().intValue(), 1);

        goToSchemaBrowser();
        selectQuery("snd", "Pkgs");
        waitAndClickAndWait(Locator.linkWithText("view data"));
        assertTextNotPresent(EXTCOLTESTDATA2, "Description 2");

        testExtensibleUI();
    }

    public void testExtensibleUI()
    {
        String referenceId = "1010";
        String startDate = "2018-01-02";
        String endDate = "2018-02-02";
        String description = "Description for the extensible project";

        log("Extensible columns in project screen");
        ProjectListPage listPage = ProjectListPage.beginAt(this , getTest1Project());
        listPage.waitForPageLoad();
        EditProjectPage editProjectPage = listPage.clickNewProject();

        waitForText("testProjects6");
        assertTextPresent("testProjects1");

        editProjectPage.setDescription(description);
        editProjectPage.setReferenceId(referenceId);
        editProjectPage.setStartDate(startDate);
        editProjectPage.setEndDate(endDate);

        editProjectPage.setProjects1TextBox("1");
        editProjectPage.setProjects4TextBox("4");

        // TODO: This will only work once we can run multiple SND projects on same server
//        ProjectViewerResult projectViewerResult;

//        listPage = editProjectPage.clickSave();
//
//        log("Verifying the new project extensible values");
//        listPage.showNotActive(true);
//        projectViewerResult = listPage.getProject(description);
//        EditProjectPage viewPage = projectViewerResult.clickView();
//        assertEquals("testProjects1 not equal to set value.", "1", viewPage.getProjects1TextBox());
//        assertEquals("testProjects5 not equal to set value.", "4", viewPage.getProjects5TextBox());

//        listPage = editProjectPage.clickProjectsCrumb();
//        listPage.showNotActive(true);

//        log("Extensible columns in project revision screen");
//        projectViewerResult = listPage.getProject(description);
//        EditProjectPage revisePage = projectViewerResult.clickRevise();
//        waitForText("testProjects6");

//        assertTextPresent("testProjects1", 4);
//        assertTextPresent("testProjects4", 4);
//        assertEquals("testProjects1 not equal to set value.", "1", revisePage.getProjects1TextBox());
//        assertEquals("testProjects5 not equal to set value.", "4", revisePage.getProjects5TextBox());

        log("Extensible columns in package screen");
        goToProjectHome();
        PackageListPage pkgListPage = PackageListPage.beginAt(this , getTest1Project());

        EditPackagePage editPage = pkgListPage.clickNewPackage();

        assertTextPresent("testPkgs1", 2);
        assertTextPresent("testPkgs4", 2);

    }

    public void testPackageApis()
    {
        DataRegionTable dataRegionTable;

        goToProjectHome();
        goToSchemaBrowser();
        viewQueryData("snd", "PkgCategories");
        assertTextPresent("Surgery", "Blood Draw", "Weight", "Vitals");

        //insert package
        runScript(SAVEPACKAGEAPI_NOCHILDREN);
        goToSchemaBrowser();
        viewQueryData("snd", "Pkgs");
        assertTextPresent("My package description", 1);

        List<Map<String, Object>> packages = executeSelectRowCommand("snd", "Pkgs").getRows();
        String newPackageId = packages.stream()
                .filter(a->a.get("Description").equals("My package description"))
                .findAny().get()
                .get("PkgId").toString();

        //get package json
        Map<String, Object> result = (Map) executeAsyncScript(getPackageWithId(newPackageId));
        assertEquals("Wrong narrative", "This is a narrative for {SNDName} ({SNDUser}), age {SNDAge}", result.get("narrative"));

        List<Map> attributes = (List) result.get("attributes");
        assertEquals("Wrong attribute count",3, attributes.size());

        List categories = (List) result.get("categories");
        assertEquals("Wrong categories", Arrays.asList(Long.valueOf(TEST_CATEGORY_ID3), Long.valueOf(TEST_CATEGORY_ID4)), categories);


        List validators = (List) (attributes.get(0)).get("validators");
        assertEquals("Wrong validator count", 1, validators.size());

        //confirm package currently has no event
        goToSchemaBrowser();
        dataRegionTable = viewQueryData("snd", "Pkgs");
        assertEquals("Has event not false","false",dataRegionTable.getDataAsText(0,"Has Event"));
        assertEquals("Has project not false","false",dataRegionTable.getDataAsText(0,"Has Project"));

        //add package to project
        runScript(createProjectApi(PKG_TEST_PROJECT_ID, "Package API test project", TEST_PROJECT_REF_ID + 10, TEST_PROJECT_START_DATE, TEST_PROJECT_FUTURE_END_DATE, "[{\"superPkgId\":" + TEST_SUPER_PKG_START_ID5 + ", \"active\":true}]"));
        refresh();
        dataRegionTable = new DataRegionTable("query",this);
        int rowIndex = dataRegionTable.getRowIndex("Description", "My package description");
        assertEquals("Has event not false","false",dataRegionTable.getDataAsText(rowIndex,"Has Event"));
        assertEquals("Has project not true","true",dataRegionTable.getDataAsText(rowIndex,"Has Project"));

        //create event
        runScript(ADDEVENT);
        refresh();
        dataRegionTable = new DataRegionTable("query",this);
        rowIndex = dataRegionTable.getRowIndex("Description", "My package description");
        assertEquals("Has event not true","true",dataRegionTable.getDataAsText(rowIndex,"Has Event"));
        assertEquals("Has project not true","true",dataRegionTable.getDataAsText(rowIndex,"Has Project"));


    }

    @Test
    public void testProjectApis() throws Exception
    {
        DataRegionTable dataRegionTable;

        goToProjectHome();
        runScript(createProjectApi(TEST_PROJECT_ID, TEST_PROJECT_DESC, TEST_PROJECT_REF_ID, TEST_PROJECT_START_DATE, TEST_PROJECT_END_DATE, TEST_PROJECT_DEFAULT_PKGS));
        runScript(reviseProjectApi(TEST_PROJECT_ID, 0, "2018-01-03", "2018-01-04", null, null));
        runScript(reviseProjectApi(TEST_PROJECT_ID, 1, "2018-01-05", null, null, null));
        runScript(editProjectApi(TEST_PROJECT_ID, 1, "description", TEST_EDIT_PROJECT_DESC));
        runScript(createProjectEvent(TEST_PROJECT_ID, 1));
        runScript(deleteProjectApi(TEST_PROJECT_ID, 2));

        goToSchemaBrowser();
        dataRegionTable = viewQueryData("snd", "Projects");
        List<String> expected = Arrays.asList("50", "0", "100", TEST_PROJECT_DB_START_DATE, TEST_PROJECT_DB_END_DATE, TEST_PROJECT_DESC, "false");
        assertEquals("Expected values not found.", expected, dataRegionTable.getRowDataAsText(0));
        expected = Arrays.asList("50", "1", "100", "2018-01-03", "2018-01-04", TEST_EDIT_PROJECT_DESC, "true");
        assertEquals("Expected values not found.", expected, dataRegionTable.getRowDataAsText(1));

        runScript(reviseProjectApi(TEST_PROJECT_ID, 1, "2018-02-01", TEST_PROJECT_COMMON_DATE, null, null));
        runScript(reviseProjectApi(TEST_PROJECT_ID, 2, TEST_PROJECT_COMMON_DATE, null, "description", TEST_REV_PROJECT_DESC));
        checkErrors();

        // Ensure only last revision can have null end date
        runScriptExpectedFail(editProjectApi(TEST_PROJECT_ID, 2, "endDate", null));

        // Check overlap of revision dates
        runScript(editProjectApi(TEST_PROJECT_ID, 3, "endDate", "2018-02-20"));
        runScriptExpectedFail(editProjectApi(TEST_PROJECT_ID, 2, "endDate", "2018-02-20"));

        // Ref id overlap validation
        runScriptExpectedFail(createProjectApi(TEST_PROJECT_ID + 1, TEST_PROJECT_DESC, TEST_PROJECT_REF_ID, TEST_PROJECT_START_DATE, TEST_PROJECT_END_DATE, TEST_PROJECT_DEFAULT_PKGS));
        runScript(createProjectApi(TEST_PROJECT_ID + 1, TEST_PROJECT_DESC2, TEST_PROJECT_REF_ID + 1, TEST_PROJECT_START_DATE, TEST_PROJECT_END_DATE, null));

        // Ref id cannot change once in use
        runScriptExpectedFail(editProjectApi(TEST_PROJECT_ID, 1, "referenceId", Integer.toString(TEST_PROJECT_REF_ID + 1)));

        // Cannot delete project if not most recent
        runScriptExpectedFail(deleteProjectApi(TEST_PROJECT_ID, 0));

        // Cannot delete in use project
        runScript(createProjectEvent(TEST_PROJECT_ID, 3));
        runScriptExpectedFail(deleteProjectApi(TEST_PROJECT_ID, 3));

        // Can only make revision from most recent project
        runScriptExpectedFail(reviseProjectApi(TEST_PROJECT_ID, 2, "2018-02-15", null, "description", TEST_REV_PROJECT_DESC));
        runScript(editProjectApi(TEST_PROJECT_ID + 1, 0, "projectItems", null));

        goToSchemaBrowser();
        dataRegionTable = viewQueryData("snd", "Projects");
        expected = Arrays.asList("50", "2", "100", "2018-02-01", "2018-02-09", TEST_EDIT_PROJECT_DESC, "false");
        assertEquals("Expected values not found.", expected, dataRegionTable.getRowDataAsText(2));
        expected = Arrays.asList("50", "3", "100", "2018-02-10", "2018-02-20", TEST_REV_PROJECT_DESC, "true");
        assertEquals("Expected values not found.", expected, dataRegionTable.getRowDataAsText(3));
        expected = Arrays.asList("51", "0", "101", TEST_PROJECT_DB_START_DATE, TEST_PROJECT_DB_END_DATE, TEST_PROJECT_DESC2, "false");
        assertEquals("Expected values not found.", expected, dataRegionTable.getRowDataAsText(4));

        goToSchemaBrowser();
        viewQueryData("snd", "ProjectItems");
        assertTextPresent(TEST_REV_PROJECT_DESC, 2);
        assertTextPresent(TEST_PROJECT_DESC, 3);
        assertTextPresent(TEST_EDIT_PROJECT_DESC, 4);
        assertTextNotPresent(TEST_PROJECT_DESC2);
    }

    @Test
    public void testSuperPackageApis() throws Exception
    {
        goToProjectHome();
        goToSchemaBrowser();

        //insert super package
        runScript(SAVEPACKAGEAPI_CHILDREN);
        goToSchemaBrowser();
        viewQueryData("snd", "SuperPkgs");
        assertTextPresent(TEST_SUPER_PKG_DESCRIPTION_1, 1);
        checkResults(TEST_SUPER_PKG_DESCRIPTION_1,
                Arrays.asList(TEST_SUPER_PKG_START_ID1 + 1,  // top-level super package is the + 0, so start at + 1
                              TEST_SUPER_PKG_START_ID1 + 2,
                              TEST_SUPER_PKG_START_ID1 + 3,
                              TEST_SUPER_PKG_START_ID1 + 4));

        //update super package without cloning, with children
        runScript(UPDATESUPERPACKAGEAPI_CHILDREN);
        goToSchemaBrowser();
        viewQueryData("snd", "SuperPkgs");
        assertTextPresent(TEST_SUPER_PKG_DESCRIPTION_2, 1);
        assertTextNotPresent(TEST_SUPER_PKG_DESCRIPTION_1);
        checkResults(TEST_SUPER_PKG_DESCRIPTION_2,
                Arrays.asList(TEST_SUPER_PKG_START_ID1 + 2,
                              TEST_SUPER_PKG_START_ID1 + 4,
                              TEST_SUPER_PKG_START_ID2,
                              TEST_SUPER_PKG_START_ID2 + 1,
                              TEST_SUPER_PKG_START_ID2 + 2,
                              TEST_SUPER_PKG_START_ID2 + 3));

        //update super package with cloning
        runScript(UPDATESUPERPACKAGEAPI_CLONE);
        goToSchemaBrowser();
        viewQueryData("snd", "SuperPkgs");
        assertTextPresent(TEST_SUPER_PKG_DESCRIPTION_3, 1);
        assertTextPresent(TEST_SUPER_PKG_DESCRIPTION_2, 1);
        checkResults(TEST_SUPER_PKG_DESCRIPTION_3,
                Arrays.asList(TEST_SUPER_PKG_START_ID3 + 1,  // top-level super package is the + 0, so start at + 1
                              TEST_SUPER_PKG_START_ID3 + 2,
                              TEST_SUPER_PKG_START_ID3 + 3,
                              TEST_SUPER_PKG_START_ID3 + 4,
                              TEST_SUPER_PKG_START_ID3 + 5,
                              TEST_SUPER_PKG_START_ID3 + 6));

        //update super package without cloning, without children
        runScript(UPDATESUPERPACKAGEAPI_NOCHILDREN);
        goToSchemaBrowser();
        viewQueryData("snd", "SuperPkgs");
        assertTextPresent(TEST_SUPER_PKG_DESCRIPTION_4, 1);
        assertTextPresent(TEST_SUPER_PKG_DESCRIPTION_3, 1);
        assertTextNotPresent(TEST_SUPER_PKG_DESCRIPTION_2);
        checkResults(TEST_SUPER_PKG_DESCRIPTION_4,
                Arrays.asList());
    }

    private void checkResults(String pkgDescription, List<Integer> subPackageIds)
    {
        List<Map<String, Object>> packages = executeSelectRowCommand("snd", "Pkgs").getRows();
        String newPackageId = packages.stream()
                .filter(a->a.get("Description").equals(pkgDescription))
                .findAny().get()
                .get("PkgId").toString();

        //get package json and assert subpackages have proper values
        Map<String, Object> results = (Map) executeAsyncScript(getPackageWithId(newPackageId));
        List<Map> subPackages = (List) results.get("subPackages");

        List<Integer> actualSubPackageIds = subPackages.stream().map(subPackage -> ((Long) subPackage.get("superPkgId")).intValue()).collect(Collectors.toList());
        assertEquals("Wrong superPkgIds in subPackages", new HashSet<>(subPackageIds), new HashSet<>(actualSubPackageIds));
    }

    @Test
    public void createNewProjectAndDeleteViaUI()
    {
        String referenceId = "1010";
        String startDate = "2018-01-02";
        String endDate = "2018-02-02";
        String description = "Description for the new project";

        log("Start with the project screen");
        ProjectListPage listPage = ProjectListPage.beginAt(this , getProjectName());
        listPage.waitForPageLoad();
        EditProjectPage editPage = listPage.clickNewProject();

        log("Setting all values in new project");
        editPage.setDescription(description);
        editPage.setReferenceId(referenceId);
        editPage.setStartDate(startDate);
        editPage.setEndDate(endDate);
        editPage.getAvailablePackage(UITEST_PROJECT_SUBPKG1)
                .clickMenuItem("Add");
        editPage.getAvailablePackage(UITEST_PROJECT_SUBPKG2)
                .clickMenuItem("Add");
        listPage = editPage.clickSave();

        log("Verifying the new project values");
        listPage.showNotActive(true);
        ProjectViewerResult projectViewerResult = listPage.getProject(description);
        EditProjectPage viewPage = projectViewerResult.clickView();
        assertEquals("Description not equal to set value.", description, viewPage.getDescription());
        assertEquals("ReferenceId not equal to set value.", referenceId, viewPage.getReferenceId());
        assertEquals("Start date not equal to set value.", startDate, viewPage.getStartDate());
        assertEquals("End date not equal to set value.", endDate, viewPage.getEndDate());
        assertTrue("Assigned package " + UITEST_PROJECT_SUBPKG1 + " not found.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG1));
        assertTrue("Assigned package " + UITEST_PROJECT_SUBPKG2 + " not found.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG2));
        assertFalse("Unassigned package found assigned.", viewPage.isAssignedPackagePresent("Vitals"));

        listPage = viewPage.clickProjectsCrumb();
        listPage.showNotActive(true);
        projectViewerResult = listPage.getProject(description);
        mouseOver(projectViewerResult.getComponentElement());
        projectViewerResult.clickDelete();
        click(Locator.button("Delete Project"));
        listPage.waitForDeleteSuccess();
        listPage.waitForPageLoad();
        listPage.showNotActive(true);
        listPage.waitForNotActiveLoad();
        listPage.showDrafts(true);
        listPage.waitForDraftsLoad();
        assertFalse("Project not deleted.", listPage.isProjectPresent(description));
    }

    @Test
    public void editProjectViaUI()
    {
        String draftReferenceId = "1011";
        String referenceId = "1012";
        String draftStartDate = "2018-01-02";
        String startDate = "2018-01-03";
        String endDate = "2018-02-03";
        String draftDescription = "Draft description for the edit test project";
        String description = "Description for the edit test project";

        log("Start with the project screen");
        ProjectListPage listPage = ProjectListPage.beginAt(this , getProjectName());
        listPage.waitForPageLoad();
        EditProjectPage editPage = listPage.clickNewProject();

        log("Setting values in new project");
        editPage.setDescription(draftDescription);
        editPage.setReferenceId(draftReferenceId);
        editPage.setStartDate(draftStartDate);
        editPage.getAvailablePackage(UITEST_PROJECT_SUBPKG1)
                .clickMenuItem("Add");
        editPage.getAvailablePackage(UITEST_PROJECT_SUBPKG2)
                .clickMenuItem("Add");
        listPage = editPage.clickSaveAsDraft();

        log("Verify project saved as draft");
        listPage.showDrafts(false);
        listPage.showNotActive(true);
        assertFalse("Project not saved as draft.", listPage.isProjectPresent(draftDescription));

        listPage.showDrafts(true);
        assertTrue("Project not saved.", listPage.isProjectPresent(draftDescription));

        ProjectViewerResult projectViewerResult = listPage.getProject(draftDescription);
        editPage = projectViewerResult.clickEdit();
        listPage = editPage.clickSave();

        log("Verify project moved from drafts to active");
        listPage.showDrafts(false);
        listPage.showNotActive(false);
        assertTrue("Project should be active.", listPage.isProjectPresent(draftDescription));

        projectViewerResult = listPage.getProject(draftDescription);
        editPage = projectViewerResult.clickEdit();
        editPage.setDescription(description);
        editPage.setReferenceId(referenceId);
        editPage.setStartDate(startDate);
        editPage.setEndDate(endDate);

        editPage.filterAvailablePackage(UITEST_PROJECT_SUBPKG3);
        editPage.getAvailablePackage(UITEST_PROJECT_SUBPKG3)
                .clickMenuItem("Add");
        editPage.getAssignedPackage(UITEST_PROJECT_SUBPKG1)
                .clickMenuItem("Remove");
        listPage = editPage.clickSave();

        log("Verify edited project saved correctly as Not Active project");
        listPage.showNotActive(false);
        assertFalse("Project not updated to Not Active project.", listPage.isProjectPresent(description));

        listPage.showNotActive(true);
        assertTrue("Edited project not found.", listPage.isProjectPresent(description));
        projectViewerResult = listPage.getProject(description);
        EditProjectPage viewPage = projectViewerResult.clickView();

        assertEquals("Description not equal to set value: " + description, description, viewPage.getDescription());
        assertEquals("ReferenceId not equal to set value: " + referenceId, referenceId, viewPage.getReferenceId());
        assertEquals("Start date not equal to set value: " + startDate, startDate, viewPage.getStartDate());
        assertEquals("End date not equal to set value: " + endDate, endDate, viewPage.getEndDate());
        assertTrue("Assigned package " + UITEST_PROJECT_SUBPKG2 + " not found.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG2));
        assertTrue("Assigned package " + UITEST_PROJECT_SUBPKG3 + " not found.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG3));
        assertFalse("Unassigned package found assigned.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG1));
    }

    @Test
    public void reviseProjectViaUI() throws Exception
    {
        String referenceId = "1013";
        String revisionReferenceId = "1014";
        String startDate = "2018-01-02";
        String revisionOldEndDate = "2018-01-05";
        String revisionEndDate = "2018-01-15";
        String revisionStartDate = "2018-01-10";
        String description = "Description for the revision test project";
        String revisionDescription = "Revised description for the revision test project";

        log("Start with the project screen");
        ProjectListPage listPage = ProjectListPage.beginAt(this , getProjectName());
        listPage.waitForPageLoad();
        EditProjectPage editPage = listPage.clickNewProject();

        log("Setting values in new project");
        editPage.setDescription(description);
        editPage.setReferenceId(referenceId);
        editPage.setStartDate(startDate);
        editPage.getAvailablePackage(UITEST_PROJECT_SUBPKG1)
                .clickMenuItem("Add");
        editPage.getAvailablePackage(UITEST_PROJECT_SUBPKG2)
                .clickMenuItem("Add");
        listPage = editPage.clickSave();

        ProjectViewerResult projectViewerResult = listPage.getProject(description);
        EditProjectPage revisePage = projectViewerResult.clickRevise();

        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        Date today = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(today);
        calendar.add(Calendar.DATE, 1);
        String todayString = formatter.format(today);
        String tomorrowString = formatter.format(calendar.getTime());

        log("Verify revision initial values");
        assertEquals("Revised project old end date not today's date.", todayString, revisePage.getEndDateRevised());
        assertEquals("Revised project new start date not tomorrow's date", tomorrowString, revisePage.getStartDate());
        assertTextPresent(description, 2);

        revisePage.setDescription(revisionDescription);
        revisePage.setReferenceId(revisionReferenceId);
        revisePage.setEndDateRevised(revisionOldEndDate);
        revisePage.setStartDate(revisionStartDate);
        revisePage.setEndDate(revisionEndDate);
        revisePage.setRevisionCopyPkgsCheckBox(true);

        listPage = revisePage.clickSaveAsDraft();
        listPage.showNotActive(true);
        assertTrue("Old revised project not found.", listPage.isProjectPresent(description + ", Revision 0"));

        log("Verify old revision end date");
        projectViewerResult = listPage.getProject(description + ", Revision 0");
        EditProjectPage viewPage = projectViewerResult.clickView();

        assertEquals("Old revision end date not equal to set value: " + revisionOldEndDate, revisionOldEndDate, viewPage.getEndDate());

        listPage = viewPage.clickProjectsCrumb();
        listPage.showDrafts(true);
        assertTrue("Revised draft project not found.", listPage.isProjectPresent(revisionDescription + ", Revision 1"));

        projectViewerResult = listPage.getProject(revisionDescription + ", Revision 1");
        viewPage = projectViewerResult.clickView();

        log("Verify new revision values.");
        assertEquals("Description not equal to set value: " + revisionDescription, revisionDescription, viewPage.getDescription());
        assertEquals("ReferenceId not equal to set value: " + revisionReferenceId, revisionReferenceId, viewPage.getReferenceId());
        assertEquals("Start date not equal to set value: " + revisionStartDate, revisionStartDate, viewPage.getStartDate());
        assertEquals("End date not equal to set value: " + revisionEndDate, revisionEndDate, viewPage.getEndDate());
        assertTrue("Assigned package " + UITEST_PROJECT_SUBPKG1 + " not found.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG1));
        assertTrue("Assigned package " + UITEST_PROJECT_SUBPKG2 + " not found.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG2));

        listPage = viewPage.clickProjectsCrumb();
        listPage.showDrafts(true);
        projectViewerResult = listPage.getProject(revisionDescription + ", Revision 1");
        revisePage = projectViewerResult.clickRevise();

        Date revEndDate = formatter.parse(revisePage.getEndDateRevised());
        calendar.setTime(revEndDate);
        calendar.add(Calendar.DATE, 1);
        String revStartDate = formatter.format(calendar.getTime());

        assertEquals("New revision start date not old date plus a day.", revStartDate, revisePage.getStartDate());

        revisePage.setStartDate(tomorrowString);
        listPage = revisePage.clickSave();

        log("Verify future project saved as Not Active");
        listPage.showNotActive(false);
        assertFalse("Revised future project saved as Not Active.", listPage.isProjectPresent(revisionDescription + ", Revision 2"));

        listPage.showNotActive(true);
        assertTrue("Revised future project not found.", listPage.isProjectPresent(revisionDescription + ", Revision 2"));

        projectViewerResult = listPage.getProject(revisionDescription + ", Revision 2");
        viewPage = projectViewerResult.clickView();

        assertEquals("Start date not equal to set value.", tomorrowString, viewPage.getStartDate());
        assertFalse("Unassigned package found assigned.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG1));
        assertFalse("Unassigned package found assigned.", viewPage.isAssignedPackagePresent(UITEST_PROJECT_SUBPKG2));
    }

    @Test
    public void verifyTestFrameworkAPITests()
    {
        log("Launching the Testing framework");
        goToProjectHome();
        beginAt(WebTestHelper.buildURL("snd",getProjectName(), "test"));
        waitForElement(Locator.tagWithClass("tr","test-results-row"));

        log("Waiting for test to load");
        clickButton("Run tests", 0);
        waitForText("Total tests:", 1, WAIT_FOR_PAGE);

        log("Verifying no test failed");
        assertTextPresent("Complete","Failed tests: 0");
    }

    private String getPerimissionTableValue(int row, int col)
    {
        List<WebElement> els = ((Locator.XPathLocator)getSimpleTableCell(Locator.id("category-security"), row, col)).child("div").child("a").child("input").findElements(getDriver());
        if (els.size() > 0)
        {
            return els.get(0).getAttribute("value");
        }

        return null;
    }

    private void clickRoleInOpenDropDown(String name)
    {
        List<WebElement> els = Locator.tagWithClassContaining("div", "btn-group open").child("ul").child("li").child("a").withText(name).findElements(getDriver());
        if (els.size() > 0)
        {
            els.get(0).click();
        }
    }

    @Test
    public void categoryPermissionsUI() throws Exception
    {
        goToProjectHome();

        log("Create permission categories");
        List<String> categories = Arrays.asList("Permission category 1", "Permission category 2", "Permission category 3");
        List<String> permissions = Arrays.asList("SND Reader", "SND Basic Submitter", "SND Data Reviewer");
        List<Integer> categoryRows = new ArrayList<>();
        PackageListPage listPage = PackageListPage.beginAt(this , getProjectName());
        EditCategoriesPage catPage = listPage.clickEditCategories();

        // create categories
        for (String category : categories)
        {
            catPage.addCategory(category, true);
            catPage = catPage.clickSave();
            waitFor(() -> false, 2000);
        }

        log("Check link on admin page.");
        beginAt(WebTestHelper.buildURL("snd",getProjectName(), "admin"));

        assertElementPresent(Locator.linkWithText("SND Security"));
        click(Locator.linkWithText("SND Security"));
        String value;
        int rowCount = getTableRowCount("category-security") - 1;

        for (int i = 0; i < rowCount; i++)
        {
            if (categories.contains(getTableCellText(Locator.id("category-security"), i, 0)))
            {
                value = getPerimissionTableValue(i, 1);
                assertNotNull(value);
                assertTrue(value.equals("None"));
                categoryRows.add(i);
            }
        }

        click(Locator.id("a_all_-3"));
        clickRoleInOpenDropDown("SND Reader");

        for (Integer r : categoryRows)
        {
            value = getPerimissionTableValue(r, 1);
            assertNotNull(value);
            assertTrue(value.equals("SND Reader"));
        }

        findButton("Clear All").click();
        acceptAlert();

        for (int k = 0; k < categoryRows.size(); k++)
        {
            value = getPerimissionTableValue(categoryRows.get(k), 1);
            assertNotNull(value);
            assertTrue(value.equals("None"));
            click(getSimpleTableCell(Locator.id("category-security"), categoryRows.get(k), 1));
            clickRoleInOpenDropDown(permissions.get(k));
        }

        waitAndClickAndWait(Locator.linkContainingText("Save"));

        for (int j = 0; j < categoryRows.size(); j++)
        {
            value = getPerimissionTableValue(categoryRows.get(j), 1);
            assertNotNull(value);
            assertTrue(value.equals(permissions.get(j)));
        }

    }

    private void truncateSndPkg() throws Exception
    {
        //cleanup - truncate snd.pkgs
        Connection conn = createDefaultConnection(false);
        TruncateTableCommand command = new TruncateTableCommand("snd", "Pkgs");
        command.execute(conn, getProjectName());

        conn = createDefaultConnection(false);
        SelectRowsCommand selectRowsCommand = new SelectRowsCommand("snd", "Pkgs");
        SelectRowsResponse selectRowsResponse = selectRowsCommand.execute(conn, getProjectName());
        assertEquals("Zero row count expected after truncating snd.Pkgs", 0, selectRowsResponse.getRows().size());
    }

    @Override
    protected BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    protected String getProjectName()
    {
        return PROJECTNAME;
    }

    protected String getTest1Project()
    {
        return getProjectName() + "/" + TEST1SUBFOLDER;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Collections.singletonList("SND");
    }
}
