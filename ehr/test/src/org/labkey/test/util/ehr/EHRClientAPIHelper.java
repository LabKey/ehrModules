/*
 * Copyright (c) 2013-2017 LabKey Corporation
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
package org.labkey.test.util.ehr;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.jetbrains.annotations.Nullable;
import org.json.simple.JSONObject;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.CommandResponse;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.PostCommand;
import org.labkey.remoteapi.query.DeleteRowsCommand;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.remoteapi.query.UpdateRowsCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.WebTestHelper;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.TestLogger;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;

public class EHRClientAPIHelper
{
    private BaseWebDriverTest _test;
    private String _containerPath;
    public static final String DATE_SUBSTITUTION = "@@CURDATE@@";
    private static Class _currentTestClass;
    private static final Map<String, Connection> _connections = new HashMap<>();

    public EHRClientAPIHelper(BaseWebDriverTest test, String containerPath)
    {
        _test = test;
        _containerPath = containerPath;

        if (!_test.getClass().equals(_currentTestClass))
        {
            // Don't remember connections between test classes
            _currentTestClass = _test.getClass();
            _connections.clear();
        }
    }

    public void createdIfNeeded(String schema, String query, Map<String, Object> row, String pkCol) throws Exception
    {
        if (!doesRowExist(schema, query, row, pkCol))
        {
            insertRow(schema, query, row, false);
        }
    }

    public Connection getConnection()
    {
        return _test.createDefaultConnection(true);
    }

    public boolean doesRowExist(String schema, String query, Map<String, Object> row, String pkCol) throws CommandException
    {
        return doesRowExist(schema, query, new Filter(pkCol, row.get(pkCol), Filter.Operator.EQUAL));
    }

    public boolean doesRowExist(String schema, String query, Filter filter) throws CommandException
    {
        SelectRowsCommand select = new SelectRowsCommand(schema, query);
        select.addFilter(filter);
        try
        {
            SelectRowsResponse resp = select.execute(getConnection(), _containerPath);

            return resp.getRowCount().intValue() > 0;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public int getRowCount(String schema, String query) throws Exception
    {
        SelectRowsCommand select = new SelectRowsCommand(schema, query);
        SelectRowsResponse resp = select.execute(getConnection(), _containerPath);

        return resp.getRowCount().intValue();
    }

    public SaveRowsResponse insertRow(String schema, String query, Map<String, Object> row, boolean expectFailure) throws CommandException
    {
        try
        {
            InsertRowsCommand insertCmd = new InsertRowsCommand(schema, query);
            insertCmd.addRow(row);
            SaveRowsResponse resp = insertCmd.execute(getConnection(), _containerPath);

            if (expectFailure)
                throw new RuntimeException("Expected command to fail");

            return resp;

        }
        catch (CommandException e)
        {
            if (!expectFailure)
                throw e;
            else
                return null;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public SaveRowsResponse updateRow(String schema, String query, Map<String, Object> row, boolean expectFailure) throws CommandException
    {
        try
        {
            SaveRowsCommand cmd = new UpdateRowsCommand(schema, query);
            cmd.addRow(row);

            SaveRowsResponse resp = cmd.execute(getConnection(), _containerPath);

            if (expectFailure)
                throw new RuntimeException("Expected command to fail");

            return resp;
        }
        catch (CommandException e)
        {
            if (!expectFailure)
                throw e;
            else
                return null;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public void deleteIfExists(String schema, String query, Map<String, Object> row, String pkCol) throws CommandException
    {
        if (doesRowExist(schema, query, row,pkCol))
        {
            deleteRow(schema, query, row, pkCol, false);
        }
    }

    public SaveRowsResponse deleteRow(String schema, String query, Map<String, Object> row, String pkCol, boolean expectFailure) throws CommandException
    {
        try
        {
            DeleteRowsCommand cmd = new DeleteRowsCommand(schema, query);
            cmd.addRow(row);

            SaveRowsResponse resp = cmd.execute(getConnection(), _containerPath);
            if (expectFailure)
                throw new RuntimeException("Expected command to fail");

            return resp;
        }
        catch (CommandException e)
        {
            if (expectFailure)
                return null;
            else throw e;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public PostCommand prepareInsertCommand(String schema, String queryName, String pkName, String[] fieldNames, Object[][] rows)
    {
        return prepareCommand("insertWithKeys", schema, queryName, pkName, fieldNames, rows, null);
    }

    public PostCommand prepareUpdateCommand(String schema, String queryName, String pkName, String[] fieldNames, Object[][] rows, @Nullable Object[][] oldKeys)
    {
        return prepareCommand("updateChangingKeys", schema, queryName, pkName, fieldNames, rows, oldKeys);
    }

    private PostCommand prepareCommand(String command, String schema, String queryName, String pkName, String[] fieldNames, Object[][] rows, @Nullable Object[][] oldKeys)
    {
        PostCommand postCommand = new PostCommand("query", "saveRows");

        JSONObject commandJson = new JSONObject();
        commandJson.put("schemaName", schema);
        commandJson.put("queryName", queryName);
        commandJson.put("command", command);
        org.json.simple.JSONArray jsonRows = new org.json.simple.JSONArray();
        int idx = 0;
        for (Object[] row : rows)
        {
            JSONObject oldKeyMap = new JSONObject();
            JSONObject values = new JSONObject();

            int position = 0;
            for (String name : fieldNames)
            {
                Object v = row[position];

                //allow mechanism to use current time,
                if (DATE_SUBSTITUTION.equals(v))
                    v = (new Date()).toString();

                if (v != null && v instanceof Date)
                    v = v.toString();

                values.put(name, v);
                if (pkName.equals(name))
                    oldKeyMap.put(name, v);

                position++;
            }

            if (oldKeys != null && oldKeys.length > idx)
            {
                JSONObject obj = new JSONObject();
                int j = 0;
                for (String field : fieldNames)
                {
                    obj.put(field, oldKeys[idx][j]);
                    j++;
                }
                oldKeyMap = obj;
            }

            JSONObject ro = new JSONObject();
            ro.put("oldKeys", oldKeyMap);
            ro.put("values", values);
            jsonRows.add(ro);
        }
        commandJson.put("rows", jsonRows);

        JSONObject commands = new JSONObject();
        commands.put("commands", Collections.singletonList(commandJson));
        postCommand.setJsonObject(commands);
        return postCommand;
    }

    public CommandException doSaveRowsExpectingError(String email, PostCommand command, JSONObject extraContext)
    {
        try
        {
            CommandResponse response = doSaveRows(email, command, extraContext, false);

            logResponse(response.getParsedData());
            assertEquals("SaveRows request succeeded unexpectedly", HttpStatus.SC_BAD_REQUEST, response.getStatusCode());

            return null; // Unreachable

        }
        catch (CommandException e)
        {
            if (HttpStatus.SC_BAD_REQUEST != e.getStatusCode())
            {
                logResponse(e.getProperties());
                assertEquals("SaveRows request failed unexpectedly", HttpStatus.SC_BAD_REQUEST, e.getStatusCode());
            }
            return e;
        }
    }

    public CommandResponse doSaveRows(String email, PostCommand command, JSONObject extraContext)
    {
        try
        {
            CommandResponse response = doSaveRows(email, command, extraContext, true);

            if (HttpStatus.SC_OK != response.getStatusCode())
            {
                logResponse(response.getParsedData());
                assertEquals("SaveRows request succeeded unexpectedly", HttpStatus.SC_OK, response.getStatusCode());
            }

            return response;
        }
        catch (CommandException e)
        {
            logResponse(e.getProperties());
            assertEquals("SaveRows request failed unexpectedly", HttpStatus.SC_OK, e.getStatusCode());
            throw new RuntimeException(e);
        }
    }

    private CommandResponse doSaveRows(String email, PostCommand command, JSONObject extraContext, boolean expectSuccess) throws CommandException
    {
        command = command.copy();
        command.getJsonObject().put("extraContext", extraContext);
        Connection connection = new Connection(WebTestHelper.getBaseURL(), email, PasswordUtil.getPassword());

        try
        {
            CommandResponse response = command.execute(connection, _containerPath);
            _test.log("Expect success: " + expectSuccess + ", actual: " + (HttpStatus.SC_OK == response.getStatusCode()));
            return response;
        }
        catch (CommandException e)
        {
            _test.log("Expect success: " + expectSuccess + ", actual: " + (HttpStatus.SC_OK == e.getStatusCode()));
            throw e;
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    public Map<String, Object> createHashMap(List<String> fieldNames, Object[] rowValues)
    {
        Map<String, Object> values = new HashMap<>();
        int position = 0;
        for (String name : fieldNames)
        {
            Object v = rowValues[position];

            //allow mechanism to use current time,
            if (DATE_SUBSTITUTION.equals(v))
                v = (new Date()).toString();

            values.put(name, v);

            position++;
        }

        return values;
    }

    private void logResponse(Map<String, Object> responseJson)
    {
        Object exception = responseJson.get("exception");
        if (exception != null)
            TestLogger.log("Expection: " + exception);

        Map<String, List<String>> ret = extractErrors(responseJson);
        for (String field : ret.keySet())
        {
            TestLogger.log("Error in field: " + field);
            for (String err : ret.get(field))
            {
                TestLogger.log(err);
            }
        }
    }

    public Map<String, List<String>> extractErrors(Map<String, Object> responseJson)
    {
        Map<String, List<String>> ret = new HashMap<>();
        if (responseJson.containsKey("errors"))
        {
            List<Map<String, Object>> errors = (List<Map<String, Object>>) responseJson.get("errors");
            for (Map<String, Object> error : errors)
            {
                List<Map<String, Object>> subErrors = (List<Map<String, Object>>) error.get("errors");
                if (subErrors != null)
                {
                    for (Map<String, Object> subError : subErrors)
                    {
                        String msg = (String) subError.get("message");
                        if (!subError.containsKey("field"))
                            throw new RuntimeException(msg);

                        String field = (String) subError.get("field");
                        String severity = (String) subError.get("severity");

                        List<String> list = ret.get(field);
                        if (list == null)
                            list = new ArrayList<>();

                        list.add((StringUtils.trimToNull(severity) == null ? "" : severity + ": ") + msg);
                        ret.put(field, list);
                    }
                }
            }
        }

        //append errors from extraContext
        if (responseJson.containsKey("extraContext") && ((Map)responseJson.get("extraContext")).containsKey("skippedErrors"))
        {
            Map<String, List<Map<String, Object>>> errors = (Map<String, List<Map<String, Object>>>) ((Map) responseJson.get("extraContext")).get("skippedErrors");

            for (List<Map<String, Object>> errorArray : errors.values())
            {
                for (Map<String, Object> subError : errorArray)
                {
                    String msg = (String) subError.get("message");
                    String field = (String) subError.get("field");
                    String severity = (String) subError.get("severity");

                    List<String> list = ret.get(field);
                    if (list == null)
                        list = new ArrayList<>();

                    list.add((StringUtils.trimToNull(severity) == null ? "" : severity + ": ") + msg);
                    ret.put(field, list);
                }
            }
        }

        return ret;
    }

    public int deleteAllRecords(String schemaName, String queryName, Filter filter) throws Exception
    {
        SelectRowsCommand sr = new SelectRowsCommand(schemaName, queryName);
        sr.addFilter(filter);
        SelectRowsResponse selectRowsResponse = sr.execute(getConnection(), _containerPath);
        String pk = selectRowsResponse.getIdColumn();

        DeleteRowsCommand dr = new DeleteRowsCommand(schemaName, queryName);
        for (Map<String, Object> row : selectRowsResponse.getRows())
        {
            Map<String, Object> r = new HashMap<>();
            r.put(pk, row.get(pk));
            dr.addRow(r);
        }

        if (!dr.getRows().isEmpty())
        {
            SaveRowsResponse resp = dr.execute(getConnection(), _containerPath);
            return resp.getRowsAffected().intValue();
        }

        return 0;
    }

    public CommandResponse insertData(String email, String schemaName, String queryName, String[] fields, Object[][] data, Map<String, Object> additionalExtraContext)
    {
        _test.log("Inserting data into " + schemaName + "." + queryName);
        JSONObject extraContext = getExtraContext();
        extraContext.put("errorThreshold", "INFO");
        extraContext.put("targetQC", "In Progress");
        if (additionalExtraContext != null)
        {
            for (String key : additionalExtraContext.keySet())
            {
                extraContext.put(key, additionalExtraContext.get(key));
            }
        }

        PostCommand insertCommand = prepareInsertCommand(schemaName, queryName, "lsid", fields, data);
        return doSaveRows(email, insertCommand, extraContext);
    }

    public void testValidationMessage(String email, String schemaName, String queryName, String[] fields, Object[][] data, Map<String, List<String>> expectedErrors)
    {
        testValidationMessage(email, schemaName, queryName, fields, data, expectedErrors, null);
    }

    public void testValidationMessage(String email, String schemaName, String queryName, String[] fields, Object[][] data, Map<String, List<String>> expectedErrors, Map<String, Object> additionalExtraContext)
    {
        expectedErrors = new HashMap<>(expectedErrors);
        expectedErrors.put("_validateOnly", Collections.singletonList("ERROR: Ignore this error"));
        _test.log("Testing validation for table: " + schemaName + "." + queryName);

        JSONObject extraContext = getExtraContext();
        extraContext.put("errorThreshold", "INFO");
        extraContext.put("validateOnly", true); //a flag to force failure
        extraContext.put("targetQC", "In Progress");
        if (additionalExtraContext != null)
            extraContext.putAll(additionalExtraContext);

        PostCommand insertCommand = prepareInsertCommand(schemaName, queryName, "lsid", fields, data);
        CommandException response = doSaveRowsExpectingError(email, insertCommand, extraContext);
        Map<String, List<String>> errors = extractErrors(response.getProperties());

        //JSONHelper.compareMap()
        assertEquals("Incorrect fields have errors.", expectedErrors.keySet(), errors.keySet());
        for (String field : expectedErrors.keySet())
        {
            Set<String> expectedErrs = new HashSet<>(expectedErrors.get(field));
            Set<String> errs = new HashSet<>(errors.get(field));

            _test.log("Expected " + expectedErrs.size() + " errors for field " + field);
            assertEquals("Wrong errors found for field: " + field, expectedErrs, errs);
        }
    }

    public JSONObject getExtraContext()
    {
        JSONObject extraContext = new JSONObject();
        extraContext.put("errorThreshold", "ERROR");
        extraContext.put("skipIdFormatCheck", true);
        extraContext.put("allowAnyId", true);
        extraContext.put("targetQC", "Completed");
        extraContext.put("isLegacyFormat", true);
        return extraContext;
    }
}
