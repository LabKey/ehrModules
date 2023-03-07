import { SchemaQuery, selectRows } from "@labkey/components";
import { Filter } from "@labkey/api";
import { FormHooks } from "./models";

export const getFormHooks = async (form: string): Promise<FormHooks> => {
    try {
        const result = await selectRows({
            schemaQuery: new SchemaQuery("lists", 'ComponentFormsMapping'),
            columns: 'Form,Hook,Component,ComponentPath',
            filterArray: [Filter.create('Form', form)],
        });

        if (result.rows.length > 0) {

            let hooks: FormHooks = {};
            result.rows.forEach(r => {
                return hooks[r['hook']?.value] = {
                    component: r['component']?.value,
                    componentPath: r['componentPath']?.value
                }
            })

            return hooks;
        }
    }
    catch (e) {
        // skip it
    }

    return {} as FormHooks;
}