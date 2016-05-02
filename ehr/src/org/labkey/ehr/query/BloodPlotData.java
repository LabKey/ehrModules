package org.labkey.ehr.query;

import org.json.JSONObject;
import java.util.Date;

/**
 * Created by Marty on 4/13/2016.
 */
public class BloodPlotData
{
    private String _id;
    private Date _date;
    private double _quantity;
    private String _species;
    private double _max_draw_pct;
    private int _blood_draw_interval;
    private double _blood_per_kg;
    private double _mostRecentWeight;
    private Date _mostRecentWeightDate;
    private Date _death;
    private double _maxAllowableBlood;
    private double _bloodPrevious;
    private double _allowablePrevious;
    private double _bloodFuture;
    private double _allowableFuture;
    private double _allowableBlood;
    private Date _minDate;
    private Date _maxDate;

    public String getId()
    {
        return _id;
    }

    public void setId(String id)
    {
        _id = id;
    }

    public Date getDate()
    {
        return _date;
    }

    public void setDate(Date date)
    {
        _date = date;
    }

    public double getQuantity()
    {
        return _quantity;
    }

    public void setQuantity(double quantity)
    {
        _quantity = quantity;
    }

    public String getSpecies()
    {
        return _species;
    }

    public void setSpecies(String species)
    {
        _species = species;
    }

    public double getMax_draw_pct()
    {
        return _max_draw_pct;
    }

    public void setMax_draw_pct(double max_draw_pct)
    {
        _max_draw_pct = max_draw_pct;
    }

    public int getBlood_draw_interval()
    {
        return _blood_draw_interval;
    }

    public void setBlood_draw_interval(int blood_draw_interval)
    {
        _blood_draw_interval = blood_draw_interval;
    }

    public double getBlood_per_kg()
    {
        return _blood_per_kg;
    }

    public void setBlood_per_kg(double blood_per_kg)
    {
        _blood_per_kg = blood_per_kg;
    }

    public double getMostRecentWeight()
    {
        return _mostRecentWeight;
    }

    public void setMostRecentWeight(double mostRecentWeight)
    {
        _mostRecentWeight = mostRecentWeight;
    }

    public Date getMostRecentWeightDate()
    {
        return _mostRecentWeightDate;
    }

    public void setMostRecentWeightDate(Date mostRecentWeightDate)
    {
        _mostRecentWeightDate = mostRecentWeightDate;
    }

    public Date getDeath()
    {
        return _death;
    }

    public void setDeath(Date death)
    {
        _death = death;
    }

    public double getMaxAllowableBlood()
    {
        return _maxAllowableBlood;
    }

    public void setMaxAllowableBlood(double maxAllowableBlood)
    {
        _maxAllowableBlood = maxAllowableBlood;
    }

    public double getBloodPrevious()
    {
        return _bloodPrevious;
    }

    public void setBloodPrevious(double bloodPrevious)
    {
        _bloodPrevious = bloodPrevious;
    }

    public double getAllowablePrevious()
    {
        return _allowablePrevious;
    }

    public void setAllowablePrevious(double allowablePrevious)
    {
        _allowablePrevious = allowablePrevious;
    }

    public double getBloodFuture()
    {
        return _bloodFuture;
    }

    public void setBloodFuture(double bloodFuture)
    {
        _bloodFuture = bloodFuture;
    }

    public double getAllowableFuture()
    {
        return _allowableFuture;
    }

    public void setAllowableFuture(double allowableFuture)
    {
        _allowableFuture = allowableFuture;
    }

    public double getAllowableBlood()
    {
        return _allowableBlood;
    }

    public void setAllowableBlood(double allowableBlood)
    {
        _allowableBlood = allowableBlood;
    }

    public Date getMinDate()
    {
        return _minDate;
    }

    public void setMinDate(Date minDate)
    {
        _minDate = minDate;
    }

    public Date getMaxDate()
    {
        return _maxDate;
    }

    public void setMaxDate(Date maxDate)
    {
        _maxDate = maxDate;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("id", new JSONObject().put("value", getId()));
        json.put("date", new JSONObject().put("value", getDate()));
        json.put("quantity", new JSONObject().put("value", getQuantity()));
        json.put("species", new JSONObject().put("value", getSpecies()));
        json.put("max_draw_pct", new JSONObject().put("value", getMax_draw_pct()));
        json.put("blood_draw_interval", new JSONObject().put("value", getBlood_draw_interval()));
        json.put("blood_per_kg", new JSONObject().put("value", getBlood_per_kg()));
        json.put("mostRecentWeight", new JSONObject().put("value", getMostRecentWeight()));
        json.put("mostRecentWeightDate", new JSONObject().put("value", getMostRecentWeightDate()));
        json.put("death", new JSONObject().put("value", getDeath()));
        json.put("maxAllowableBlood", new JSONObject().put("value", getMaxAllowableBlood()));
        json.put("bloodPrevious", new JSONObject().put("value", getBloodPrevious()));
        json.put("allowablePrevious", new JSONObject().put("value", getAllowablePrevious()));
        json.put("bloodFuture", new JSONObject().put("value", getBloodFuture()));
        json.put("allowableFuture", new JSONObject().put("value", getAllowableFuture()));
        json.put("allowableBlood", new JSONObject().put("value", getAllowableBlood()));
        json.put("minDate", new JSONObject().put("value", getMinDate()));
        json.put("maxDate", new JSONObject().put("value", getMaxDate()));

        return json;
    }
}
