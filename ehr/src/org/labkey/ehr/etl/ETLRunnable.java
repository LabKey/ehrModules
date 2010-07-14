package org.labkey.ehr.etl;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import junit.framework.Test;
import junit.framework.TestSuite;
import org.apache.commons.dbcp.BasicDataSource;
import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.TableInfo;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;

import javax.sql.DataSource;
import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class ETLRunnable implements Runnable
{
    private final Map<String, String> listQueries;
    private final Map<String, String> studyQueries;
    private final DataSource originDataSource;
    private final User user;
    private final Container container;
    private final Properties props;
    private final static String PROP_DOMAIN_KEY = "wnprc.ehr.etl";
    private final static String LAST_TIMESTAMP_PROP_KEY_PREFIX = "timestamp.";
    private final static int MAX_VALIDATION_ERRORS_PER_SET = 5;

    private final static Logger log = Logger.getLogger(ETLRunnable.class);

    public ETLRunnable() throws IOException, SQLException, ValidEmail.InvalidEmailException
    {
        props = new Properties();
        InputStream is = null;
        try
        {
            is = new FileInputStream(getResource("etl.properties"));
            props.load(is);
        }
        finally
        {
            close(is);
        }

        this.originDataSource = getOriginDataSource();
        this.user = UserManager.getUser(new ValidEmail(props.getProperty("labkey.user")));
        this.container = ContainerManager.getForPath(props.getProperty("labkey.container"));
        this.listQueries = loadQueries(getResource("lists").listFiles());
        this.studyQueries = loadQueries(getResource("datasets").listFiles());
    }

    @Override
    public void run()
    {

        if (isDisabled())
        {
            log.info("EHR database sync invoked, but is disabled in server/customModules/ehr/resources/etl/etl.properties");
            return;
        }

        try
        {
            log.info("Begin incremental sync from external datasource.");
            UserSchema listSchema = QueryService.get().getUserSchema(this.user, this.container, "lists");
            UserSchema studySchema = QueryService.get().getUserSchema(this.user, this.container, "study");

            merge(listQueries, listSchema);
            // XXX datasets turned off
            //merge(studyQueries, studySchema);

            log.info("End incremental sync run.");

        }
        catch (Throwable x)
        {
            // Depending on the configuration of the executor,
            // if run() throws anything future executions may all canceled.
            // But we'd rather catch unexepcted exceptions and continue trying,
            // to smooth over any transient issues like the remote datasource
            // being temporarily unavailable.
            log.warn("Incremental sync error:", x);
        }

        // TODO log all last synced timestamps for all targets here
    }

    private boolean isDisabled()
    {
        String isDisabledProperty = props.getProperty("labkey.etlDisabled");

        return isDisabledProperty != null && isDisabledProperty.equals("true");
    }


    void merge(Map<String, String> queries, UserSchema schema)
    {
        Connection originConnection = null;

        try
        {
            originConnection = originDataSource.getConnection();
            DbScope scope = schema.getDbSchema().getScope();

            // for each target collection
            for (Map.Entry<String, String> kv : queries.entrySet())
            {

                String targetTableName = kv.getKey();
                TableInfo targetTable = schema.getTable(targetTableName);

                if (targetTable == null)
                {
                    log.warn(targetTableName + " is not a known labkey study name, skipping the so-named sql query");
                    continue;
                }

                //
                //

                Collection<String> keyFieldNames = targetTable.getPkColumnNames();
                //
                //


                log.info("preparing query " + targetTableName);
                PreparedStatement ps = originConnection.prepareStatement(kv.getValue());
                // Hack for MySQL. If setFetchSize is not set, or is set to any value other than Integer.MIN_VALUE,
                // mysql driver will read the whole resultset into memory and run out of heap space.
                ps.setFetchSize(Integer.MIN_VALUE);
                // Each statement will have zero or more bind variables in it. Set them all to
                // the baseline timestamp date.
                int paramCount = ps.getParameterMetaData().getParameterCount();
                java.sql.Date fromDate = new java.sql.Date(getLastTimestamp(targetTableName).longValue());
                for (int i = 1; i <= paramCount; i++)
                {
                    ps.setDate(i, fromDate);
                }


                log.info("querying for " + targetTableName + " since " + fromDate);
                ResultSet rs = null;

                QueryUpdateService updater = targetTable.getUpdateService();
                int adds = 0, updates = 0, errors = 0;

                Long newBaselineTimestamp = getOriginDataSourceCurrentTime();
                Boolean commit = true;

                try
                {
                    rs = ps.executeQuery();
                    scope.beginTransaction();
                    // for each input record
                    while (rs.next())
                    {
                        Map<String, Object> sourceRow = mapResultSetRow(rs);
                        // TODO may have to inspect the metadata to get the key field(s) rather than assume "objectid" to make lists and demographic-type datasets work
                        // TODO avoid overl arge audit logging

                        //String selectKey = "objectid";
                        //Object selectValue = sourceRow.get("objectid");
                        Map<String, Object> matcher = getMatcher(keyFieldNames, sourceRow);

                        try
                        {
                            List<Map<String, Object>> matcherList = Collections.singletonList(matcher);
                            List<Map<String, Object>> match = updater.getRows(this.user, this.container, matcherList);
                            if (match.isEmpty())
                            {
                                updater.insertRows(user, container, Collections.singletonList(sourceRow));
                                adds++;
                            }
                            else
                            {
                                updater.updateRows(user, container, Collections.singletonList(sourceRow), matcherList);
                                updates++;
                            }
                        }

                        catch (ValidationException e)
                        {
                            // todo log info about row that failed
                            log.error("ValidationException: "+ e.getMessage());
                            errors++;
                            if (errors > MAX_VALIDATION_ERRORS_PER_SET)
                            {
                                log.warn(String.format("Aborting %s after %d validation errors", targetTable.getName(), MAX_VALIDATION_ERRORS_PER_SET));
                                commit = false;
                                break;
                            }
                        }

                        catch (Exception e)
                        {
                            // log info about the record that broke
                            log.error("Fatal error for " + targetTableName, e);
                            commit = false;
                            break;
                        }

                    }

                }

                finally
                {
                    close(rs);

                    if (commit)
                    {
                        // commit
                        scope.commitTransaction();
                        setLastTimestamp(targetTableName, newBaselineTimestamp);
                        log.info(String.format("'%s' - added %d and updated %d with %d validation failures", targetTableName, adds, updates, errors));
                    }
                    else
                    {
                        // rollback
                        scope.rollbackTransaction();
                        log.warn("rollback update of " + targetTableName);
                    }

                }
            }


        }
        catch (SQLException e)
        {
            log.error("error syncing", e);
        }
        finally
        {
            close(originConnection);
        }
    }

    private Map<String, Object> getMatcher(Collection<String> keyFieldNames, Map<String, Object> sourceRow)
    {
        Map<String, Object> matcher = new HashMap<String, Object>();
        for (String keyFieldName : keyFieldNames) {
            matcher.put(keyFieldName, sourceRow.get(keyFieldName));
        }

        return matcher;
    }


    /**
     * @param tableName
     * @return the timestamp last stored by @setLastTimestamp, or 0 time if not present
     */
    private Long getLastTimestamp(String tableName)
    {
        Map<String, String> m = PropertyManager.getProperties(PROP_DOMAIN_KEY);
        String value = m.get(LAST_TIMESTAMP_PROP_KEY_PREFIX + tableName);
        return null == value ? 0L : Long.parseLong(m.get(LAST_TIMESTAMP_PROP_KEY_PREFIX + tableName));
    }

    /**
     * Persist the baseline timestamp to use next time we sync this table. It should be the origin db's idea of what time it is.
     *
     * @param ts the timestamp we want returned by the next call to @getLastTimestamp
     */
    private void setLastTimestamp(String tableName, Long ts)
    {
        log.info(String.format("setting new baseline timestamp of %s on collection %s", new Date(ts.longValue()).toString(), tableName));
        PropertyManager.PropertyMap pm = PropertyManager.getWritableProperties(PROP_DOMAIN_KEY, true);
        pm.put(LAST_TIMESTAMP_PROP_KEY_PREFIX + tableName, ts.toString());
        PropertyManager.saveProperties(pm);
    }

    /**
     * @return the current time according to the origin db.
     * @throws SQLException
     */
    private Long getOriginDataSourceCurrentTime() throws SQLException
    {
        Connection con = null;
        Long ts = null;
        try
        {
            con = originDataSource.getConnection();
            PreparedStatement ps = con.prepareStatement("select now()");
            ResultSet rs = ps.executeQuery();
            if (rs.next())
            {
                // XXX probably use getTimestamp
                ts = new Long(rs.getTimestamp(1).getTime());
            }
        }
        finally
        {
            close(con);
        }
        return ts;
    }


    private DataSource getOriginDataSource() throws IOException
    {

        BasicDataSource ds = new BasicDataSource();
        ds.setDriverClassName(props.getProperty("jdbc.driver"));
        ds.setUsername(props.getProperty("jdbc.user"));
        ds.setPassword(props.getProperty("jdbc.password"));
        ds.setUrl(props.getProperty("jdbc.url"));
        ds.setPoolPreparedStatements(true);

        return ds;
    }

    private Map<String, String> loadQueries(File[] sqlFiles) throws IOException
    {
        Map<String, String> qMap = new HashMap<String, String>();

        for (File f : sqlFiles)
        {
            if (!f.getName().endsWith("sql")) continue;
            String sql = Files.toString(f, Charsets.UTF_8);
            String key = f.getName().substring(0, f.getName().indexOf('.'));
            qMap.put(key, sql);
        }

        return qMap;
    }

    private Map<String, Object> mapResultSetRow(ResultSet rs) throws SQLException
    {
        Map<String, Object> map = new HashMap<String, Object>();
        ResultSetMetaData md = rs.getMetaData();
        int columnCount = md.getColumnCount();
        for (int i = 1; i <= columnCount; i++)
        {
            map.put(md.getColumnName(i), rs.getObject(i));
        }
        return map;
    }

    /**
     * @param path relative to ehr/resources/etl dir
     * @return File object for the specified file or directory
     */
    private File getResource(String path)
    {
        return new File(ModuleLoader.getInstance().getModule("EHR").getExplodedPath() + "/etl/" + path);
    }

    private static void close(Closeable o)
    {
        if (o != null) try
        {
            o.close();
        }
        catch (Exception ignored)
        {
        }
    }

    private static void close(Connection o)
    {
        if (o != null) try
        {
            o.close();
        }
        catch (Exception ignored)
        {
        }
    }

    private static void close(ResultSet o)
    {
        if (o != null) try
        {
            o.close();
        }
        catch (Exception ignored)
        {
        }
    }

    public static class TestCase extends junit.framework.TestCase
    {

        public void testInit() throws Exception
        {
            ETLRunnable etl = new ETLRunnable();
            etl.run();
        }

        /*
            public void testGetResources() throws Exception {
                File root = ModuleLoader.getInstance().getModule("EHR").getExplodedPath();
                throw new RuntimeException("exploded path: "+root.getAbsolutePath());
            }

        */

        public static Test suite()
        {
            return new TestSuite(TestCase.class);
        }

    }

}
