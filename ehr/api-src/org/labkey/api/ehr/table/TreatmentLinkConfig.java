/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
package org.labkey.api.ehr.table;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * A center's vocabulary for the treatment links rendered by {@link TreatmentLinkDisplayColumnFactory}: which data entry
 * form each treatment category routes to, what the link says, and which report the user returns to.
 *
 * The builder defaults cover the link text, the order id parameter, the return report, and the forms that categories
 * without a mapping of their own route to. Category-specific routing is never assumed: a center that treats a category
 * differently must name it, so its routing is visible where the config is declared rather than inherited from here.
 */
public class TreatmentLinkConfig
{
    /**
     * The data entry forms a category routes to. A row carrying a caseid goes to a rounds-style form scoped to that
     * case; a row without one goes to a standalone entry form.
     */
    public record FormTypes(String withCase, String withoutCase) {}

    private final String _orderIdParam;
    private final String _linkText;
    private final String _returnReport;
    private final Map<String, FormTypes> _formTypesByCategory;
    private final FormTypes _defaultFormTypes;

    private TreatmentLinkConfig(Builder builder)
    {
        _orderIdParam = builder._orderIdParam;
        _linkText = builder._linkText;
        _returnReport = builder._returnReport;
        _formTypesByCategory = Map.copyOf(builder._formTypesByCategory);
        _defaultFormTypes = builder._defaultFormTypes;
    }

    /** Name of the URL parameter carrying the treatment order's objectid. */
    public String getOrderIdParam()
    {
        return _orderIdParam;
    }

    public String getLinkText()
    {
        return _linkText;
    }

    /** The animalHistory report the data entry form returns to. */
    public String getReturnReport()
    {
        return _returnReport;
    }

    /** Category match is case-sensitive, matching the behavior of the per-center code this replaced. */
    public FormTypes getFormTypes(String category)
    {
        return _formTypesByCategory.getOrDefault(category, _defaultFormTypes);
    }

    public static Builder builder()
    {
        return new Builder();
    }

    /** Starts from an existing config, for centers that need a variant of one they have already declared. */
    public static Builder builder(TreatmentLinkConfig base)
    {
        return new Builder(base);
    }

    public static class Builder
    {
        private String _orderIdParam = "treatmentid";
        private String _linkText = "Record Treatment";
        private String _returnReport = "clinMedicationSchedule";
        private final Map<String, FormTypes> _formTypesByCategory = new LinkedHashMap<>();
        private FormTypes _defaultFormTypes = new FormTypes("Clinical Rounds", "medicationTreatment");

        private Builder()
        {
        }

        private Builder(TreatmentLinkConfig base)
        {
            _orderIdParam = base._orderIdParam;
            _linkText = base._linkText;
            _returnReport = base._returnReport;
            _formTypesByCategory.putAll(base._formTypesByCategory);
            _defaultFormTypes = base._defaultFormTypes;
        }

        public Builder orderIdParam(String orderIdParam)
        {
            _orderIdParam = orderIdParam;
            return this;
        }

        public Builder linkText(String linkText)
        {
            _linkText = linkText;
            return this;
        }

        public Builder returnReport(String returnReport)
        {
            _returnReport = returnReport;
            return this;
        }

        public Builder formTypes(String category, String withCase, String withoutCase)
        {
            return formTypes(category, new FormTypes(withCase, withoutCase));
        }

        public Builder formTypes(String category, FormTypes formTypes)
        {
            _formTypesByCategory.put(category, formTypes);
            return this;
        }

        /** Applies to any category without an explicit mapping. */
        public Builder defaultFormTypes(String withCase, String withoutCase)
        {
            _defaultFormTypes = new FormTypes(withCase, withoutCase);
            return this;
        }

        public TreatmentLinkConfig build()
        {
            return new TreatmentLinkConfig(this);
        }
    }
}
