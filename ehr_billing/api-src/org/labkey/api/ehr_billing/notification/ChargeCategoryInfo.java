/*
 * Copyright (c) 2024-2026 LabKey Corporation
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

public class ChargeCategoryInfo
{
    public double totalQuantity;
    public double totalCost;
    public String categoryLabel;
    public String categoryURL;

    public ChargeCategoryInfo(String categoryLabel, String categoryURL, double totalQuantity, double totalCost)
    {
        this.categoryLabel = categoryLabel;
        this.categoryURL = categoryURL;
        this.totalQuantity = totalQuantity;
        this.totalCost = totalCost;
    }

    public ChargeCategoryInfo()
    {
    }

    public double getTotalQuantity()
    {
        return totalQuantity;
    }

    public void setTotalQuantity(double total)
    {
        this.totalQuantity = total;
    }

    public double getTotalCost()
    {
        return totalCost;
    }

    public void setTotalCost(double totalCost)
    {
        this.totalCost = totalCost;
    }

    public String getCategoryLabel()
    {
        return categoryLabel;
    }

    public void setCategoryLabel(String categoryLabel)
    {
        this.categoryLabel = categoryLabel;
    }

    public String getCategoryURL()
    {
        return categoryURL;
    }

    public void setCategoryURL(String categoryURL)
    {
        this.categoryURL = categoryURL;
    }
}
