/*
 * Copyright (c) 2019 LabKey Corporation
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
package org.labkey.api.ehr_billing.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.Date;
import java.util.List;
import java.util.Map;

public interface BillingNotificationProvider
{
    /**
     * @return Center specific Billing module.
     */
    public Module getModule();

    /**
     * @return Notification Name - ex. 'Billing Notification' or 'Finance Notification'.
     */
    public String getName();

    /**
     * @return Scheduled cron job string - ex. "0 0 8 * * ?" will send notification every day at 8:00 am
     */
    public String getCronString();

    /**
     * @return Description of your scheduled cron job. ex "Every Day at 8:00AM"
     */
    public String getScheduleDescription();

    /**
     * @return Description of what your billing notification entails.
     */
    public String getDescription();

    /**
     * @return Map of Category and queryName to run. Queries are expected to be ehr_billing queries.
     */
    public Map<String, String> getCategoriesToQuery();

    /**
     * @return Map of Category and Containers in which the corresponding queries listed in getCategoriesToQuery() live.
     */
    public Map<String, Container> getQueryCategoryContainerMapping(Container c);

    /**
     * @return List of field descriptors, essentially a calculated column in your queries that you'd want to show as part of the notification.
     */
    public List<FieldDescriptor> getFieldDescriptor();

    /**
     * @return Additional notifications that are not covered in BillingNotification.java
     */
    public List<StringBuilder> getAdditionalNotifications(User user);

    /**
     * @return name or abbreviation of your Primate Center
     */
    public String getCenterName();

    /**
     * @param u User
     * @param c Container
     * @param alertType Type of alert to append to StringBuilder msg.
     * @param msg a StringBuilder instance to append message to if preferred esp. in the case when billing schema is not enabled in a given container
     * @return false if billing public linked schema is not enabled in a given container c, true otherwise.
     */
    public boolean isBillingSchemaEnabled(User u, Container c, String alertType, StringBuilder msg);

    /**
     * @return Name of center specific billing schema
     */
    public String getCenterSpecificBillingSchema();

    /**
     * @param u User
     * @param c Container where custom charge categories are defined
     * @param startDate Filter custom charge category query where date >= startDate
     * @param endDate Filter custom charge category query where date <= endDate
     * @param totalsByCategory Add totals for the center-specific custom category to be displayed in the Charge Summary section of the notification.
     * @param additionalCategoryUrls Add URLs for center-specific custom category to be linked to the Category
     * See WNPRC Billing's implementation of this method for an example.
     */
    public default void getAdditionalChargeCategoryInfo(User u, Container c, Date startDate, Date endDate,
                                            final Map<String, Map<String, Double>> totalsByCategory, Map<String, String> additionalCategoryUrls)
    {

    }

}
