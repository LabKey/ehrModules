package org.labkey.api.ehr.dataentry.forms;

import org.json.old.JSONObject;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.view.ActionURL;

import java.util.List;

/**
 * Adds a link only visible to admins on the EHR data entry page. Override dataEntryLink() with the desired URL. _formContext
 * can be used to get URL container and context.
 */
public abstract class AdminLinksFormType extends AbstractDataEntryForm
{
    protected final DataEntryFormContext _formContext;

    public AdminLinksFormType(DataEntryFormContext ctx, Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(ctx, owner, name, label, category, sections);
        _formContext = ctx;
    }

    protected abstract ActionURL dataEntryLink();

    @Override
    public JSONObject toJSON(boolean includeFormElements)
    {
        JSONObject json = super.toJSON(includeFormElements);
        json.put("url", dataEntryLink());

        return json;
    }

    @Override
    public boolean isAvailable()
    {
        return super.isAvailable() && getCtx().getContainer().hasPermission(getCtx().getUser(), AdminPermission.class);
    }

    @Override
    protected List<Class<? extends Permission>> getAvailabilityPermissions()
    {
        List<Class<? extends Permission>> perms = super.getAvailabilityPermissions();
        perms.add(AdminPermission.class);
        return perms;
    }
}
