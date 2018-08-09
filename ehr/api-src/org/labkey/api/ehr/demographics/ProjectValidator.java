package org.labkey.api.ehr.demographics;

import org.jetbrains.annotations.Nullable;
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
    /** Returns an error string if the project is not a valid assignment for an animal */
    @Nullable
    String validateAssignment(String id, Integer projectId, Date date, User user, Container container, String protocol);
}
