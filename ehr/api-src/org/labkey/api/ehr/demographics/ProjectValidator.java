package org.labkey.api.ehr.demographics;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Date;

/**
* A source for providing the valid project Assignments for an animal
 *
 * Author: ankurj
 * Date: 7/6/2018
* */
public interface ProjectValidator
{
/** Returns true if the project is a valid assignment for an animal*/
    boolean validateAssignment(String id, Integer projectId, Date date, User user, Container container, String protocol);

    boolean isAvailable(Container c, User u);
}
