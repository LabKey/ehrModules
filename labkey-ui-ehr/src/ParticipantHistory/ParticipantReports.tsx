import React, { FC, memo, useState } from 'react';
import {
    GridPanelWithModel,
    NotificationsContextProvider,
    SchemaQuery,
    useServerContext,
    withServerContext,
} from '@labkey/components';

const modelId = 'editable_ehr_lookups';
const queryConfig = {
    bindURL: false,
    id: modelId,
    maxRows: 500,
    schemaQuery: new SchemaQuery('core', 'Users'),
    includeTotalCount: true,
};

const ParticipantReportsImpl: FC = memo(() => {
    const [activeTab, setActiveTab] = useState<number>(0);
    const { user } = useServerContext();

    return (
        <div>
            <div className="panel-body table-responsive">
                <ul className="nav nav-tabs">
                    <li className={activeTab === 0 ? 'active' : ''} id={'tab1'} key={'tab1'}>
                        <a onClick={() => setActiveTab(0)}>tab1</a>
                    </li>
                    <li className={activeTab === 1 ? 'active' : ''} id={'tab2'} key={'tab2'}>
                        <a onClick={() => setActiveTab(1)}>tab2</a>
                    </li>
                </ul>
                {activeTab === 0 && (
                    <div>
                        <NotificationsContextProvider>
                            <GridPanelWithModel allowSelections={false} asPanel={true} queryConfig={queryConfig} />
                        </NotificationsContextProvider>
                    </div>
                )}
                {activeTab === 1 && <div className={'col-xs-12'}>{'User: ' + user.displayName}</div>}
            </div>
        </div>
    );
});

export const ParticipantReports = withServerContext(ParticipantReportsImpl);
