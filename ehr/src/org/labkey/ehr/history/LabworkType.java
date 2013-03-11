package org.labkey.ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/6/13
 * Time: 11:12 AM
 */
public interface LabworkType
{
    public String getName();

    public List<String> getResults(Container c, User u, String runId);

    public Map<String, List<String>> getResults(Container c, User u, List<String> runIds);

    public Map<String, List<String>> getResults(Container c, User u, String id, Date minDate, Date maxDate);
}
