import React, { FC, memo, useState, useEffect, useMemo } from 'react';
import { GridPanelWithModel, SchemaQuery, useServerContext } from '@labkey/components';
import { EHRAPIWrapper, getDefaultEHRAPIWrapper } from '../api/APIWrapper';
import { AnimalHistoryReports, getAnimalHistoryReports } from '../api/actions';


const modelId = 'editable_ehr_lookups'
const queryConfig = {
    bindURL: false,
    id: modelId,
    maxRows: 500,
    schemaQuery: new SchemaQuery('core', 'Users'),
    includeTotalCount: true,
};

interface ParticipantReportsProps {
    api?: EHRAPIWrapper;
}

export const ParticipantReports: FC<ParticipantReportsProps> = memo(props => {

    const { api } = props;
    const [activeTab, setActiveTab] = useState<number>(0);
    const [reports, setReports] = useState<AnimalHistoryReports>();
    const { user } = useServerContext();


    const _api = useMemo(() => {
        return api ?? getDefaultEHRAPIWrapper()
    }, [api]);

    useEffect(() => {
        (async () => {
            try {
                const reports = await _api.getAnimalHistoryReports();
                setReports(reports);
            } catch (error) {
                // do nothing, already logged
            }
        })();
    }, []);

    return (
        <div>
            <div className="panel-body table-responsive">
                { reports &&
                    <ul className="nav nav-tabs">
                        {reports.categories.map((category, index) => {
                            return (
                                <li key={category.category} id={category.category} className={activeTab === index ? "active" : ""}>
                                    <a onClick={() => setActiveTab(index)}>{category.category}</a>
                                </li>
                            )
                        })}
                    </ul>
                }
                {/*{activeTab === 0 &&*/}
                {/*        <div>*/}
                {/*            <GridPanelWithModel*/}
                {/*                    asPanel={true}*/}
                {/*                    queryConfig={queryConfig}*/}
                {/*                    allowSelections={false}*/}
                {/*            />*/}
                {/*        </div>*/}
                {/*}*/}
                {/*{activeTab === 1 &&*/}
                {/*        <div className={'col-xs-12'}>{'User: ' + user.displayName}</div>*/}

                {/*}*/}
            </div>
        </div>
    )

});