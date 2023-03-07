import React, { createContext, FC, memo, useEffect, useState } from "react";
import { ErrorBoundary } from "@labkey/components";
import { getFormHooks } from "./APIUtils";
import { FormHooks } from "./models";

interface DynamicLoadingContext {
    hooks: FormHooks
}

const Context = createContext<DynamicLoadingContext>(undefined);
const DynamicLoadingContextProvider = Context.Provider;
export const DynamicLoadingContextConsumer = Context.Consumer;

export const DynamicLoadingWrapper: FC = memo(props => {

    const [formHooks, setFormHooks] = useState<any>();

    useEffect(() => {
        (async () => {
            try {
                const hooks = await getFormHooks("DynamicLoading");
                setFormHooks(hooks);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    if (!formHooks)
        return null;

    return (
        <ErrorBoundary>
            {formHooks &&
                <DynamicLoadingContextProvider value={formHooks}>
                    {props.children}
                </DynamicLoadingContextProvider>
            }
        </ErrorBoundary>

    )
})