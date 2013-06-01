package org.labkey.ehr;

import org.labkey.api.action.SpringActionController;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleHtmlView;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.SimpleAction;
import org.labkey.api.resource.Resource;
import org.labkey.api.util.Path;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.WebPartView;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.Controller;

/**
 * User: bimber
 * Date: 5/23/13
 * Time: 6:26 PM
 */
public class EHRActionResolver extends SpringActionController.DefaultActionResolver
{
    public EHRActionResolver()
    {
        super(EHRController.class);
    }

    public Controller resolveActionName(Controller actionController, String actionName)
    {
        return super.resolveActionName(actionController, actionName);
    }

    protected SpringActionController.HTMLFileActionResolver getHTMLFileActionResolver()
    {
        return new EHRHTMLFileActionResolver();
    }

    private class EHRHTMLFileActionResolver extends SpringActionController.HTMLFileActionResolver
    {
        public EHRHTMLFileActionResolver()
        {
            super(EHRModule.CONTROLLER_NAME);
        }

        @Override
        protected HTMLFileActionDescriptor createFileActionDescriptor(String actionName, Resource r)
        {
            return new EHRHTMLFileActionDescriptor(actionName, r);
        }

        private class EHRHTMLFileActionDescriptor extends HTMLFileActionDescriptor
        {
            private EHRHTMLFileActionDescriptor(String primaryName, Resource resource)
            {
                super(primaryName, resource);
            }

            @Override
            public Class<? extends Controller> getActionClass()
            {
                return EHRSimpleAction.class;
            }

            @Override
            public Controller createController(Controller actionController)
            {
                return new EHRSimpleAction(_resource);
            }
        }
    }

    private class EHRSimpleAction extends SimpleAction
    {

        public EHRSimpleAction(Resource r)
        {
            super(r);
        }

        @Override
        public ModelAndView handleRequest() throws Exception
        {
            EHRServiceImpl service = (EHRServiceImpl)EHRServiceImpl.get();

            //TODO: best method to find action name?
            Resource r = service.getActionOverride(getViewContext().getActionURL().getAction(), getViewContext().getContainer());
            if (r != null)
            {
                ModuleHtmlView view = new ModuleHtmlView(r);
                view.setFrame(WebPartView.FrameType.NONE);

                //override page template if view requests
                if(null != view.getPageTemplate())
                    getPageConfig().setTemplate(view.getPageTemplate());

                return view;
            }

            return super.handleRequest();
        }
    }
}