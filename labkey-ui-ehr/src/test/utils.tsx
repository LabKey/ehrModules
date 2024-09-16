import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { App, Container, ServerContext, ServerContextProvider } from '@labkey/components';

// Should this be exported from @labkey/components?
export interface ServerContextProviderProps {
    initialContext?: ServerContext;
}

export const renderWithServerContext = (
    node: ReactElement,
    serverContext: ServerContext,
    options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
    return render(node, {
        wrapper: _props => <ServerContextProvider {..._props} {...(serverContext as ServerContextProviderProps)} initialContext={serverContext} />,
        ...options,
    });
};

export function defaultServerContext(overrides?: Partial<ServerContext>): ServerContext {
    return {
        container: new Container(TEST_CONTAINER_CONFIG),
        user: App.TEST_USER_PROJECT_ADMIN,
        ...overrides,
    } as ServerContext;
}

interface ContainerDateFormats {
    dateFormat: string;
    dateTimeFormat: string;
    numberFormat: string;
}

const TEST_DATE_FORMATS: ContainerDateFormats = {
    dateFormat: 'yyyy-MM-dd',
    dateTimeFormat: 'yyyy-MM-dd HH:mm',
    numberFormat: null,
};

const TEST_CONTAINER_CONFIG = {
    activeModules: ['a', 'b', 'c'],
    formats: TEST_DATE_FORMATS,
    id: 'a685712e-0900-103a-9486-1131958dce60',
    isContainerTab: false,
    isWorkbook: false,
    name: 'TestProjectContainer',
    parentId: '785eb92a-95aa-1039-9db0-ffabf47c5c38',
    parentPath: '/',
    path: '/TestProjectContainer',
    title: 'Test Project Container',
    type: 'project',
};