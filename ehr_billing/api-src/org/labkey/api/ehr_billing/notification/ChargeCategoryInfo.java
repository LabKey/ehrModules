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
