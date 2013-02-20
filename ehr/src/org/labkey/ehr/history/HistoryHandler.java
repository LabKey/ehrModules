package org.labkey.ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:12 PM
 */
public interface HistoryHandler
{
    public boolean isAvailable(Container c, User u);
}
