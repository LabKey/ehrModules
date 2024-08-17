import React, { FC, memo, useState } from 'react';
import { GridPanelWithModel, SchemaQuery, useServerContext } from '@labkey/components';


const modelId = 'editable_ehr_lookups'
const queryConfig = {
    bindURL: false,
    id: modelId,
    maxRows: 500,
    schemaQuery: new SchemaQuery('core', 'Users'),
    includeTotalCount: true,
};

export const ParticipantReports: FC = memo(() => {

    const [activeTab, setActiveTab] = useState<number>(0);
    const { user } = useServerContext();

    return (
        <div>
            <div className="panel-body table-responsive">
                <ul className="nav nav-tabs">
                    <li key={'tab1'} id={'tab1'} className={activeTab === 0 ? "active" : ""}>
                        <a onClick={() => setActiveTab(0)}>tab1</a>
                    </li>
                    <li key={'tab2'} id={'tab2'} className={activeTab === 1 ? "active" : ""}>
                        <a onClick={() => setActiveTab(1)}>tab2</a>
                    </li>
                </ul>
                {activeTab === 0 &&
                        <div>
                            <GridPanelWithModel
                                    asPanel={true}
                                    queryConfig={queryConfig}
                                    allowSelections={false}
                            />
                        </div>
                }
                {activeTab === 1 &&
                        <div className={'col-xs-12'}>{'User: ' + user.displayName}</div>

                }
            </div>
        </div>
    )

});