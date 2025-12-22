import React, { FC, memo } from 'react';
import { GridPanelWithModel, SchemaQuery, Tab, Tabs } from '@labkey/components';

const queryConfig = {
    bindURL: false,
    id: 'participant_view_query',
    maxRows: 50,
    schemaQuery: new SchemaQuery('core', 'Users'),
    includeTotalCount: true,
};

export const ParticipantView: FC = memo(() => {

    return (
        <div className="participant-view-container">
            <Tabs>
                <Tab eventKey="general" title="General">
                    <div style={{ padding: '15px' }}>
                        <Tabs>
                            <Tab eventKey="demographics" title="Demographics">
                                <div>
                                    <h4>Demographics Report</h4>
                                    <GridPanelWithModel
                                        asPanel={true}
                                        queryConfig={queryConfig}
                                        allowSelections={false}
                                    />
                                </div>
                            </Tab>
                            <Tab eventKey="abstract" title="Abstract">
                                <div>
                                    <h4>Abstract Report</h4>
                                    <p>This is the abstract report content.</p>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </Tab>
                <Tab eventKey="clinical" title="Clinical">
                    <div style={{ padding: '15px' }}>
                        <Tabs>
                            <Tab eventKey="history" title="Clinical History">
                                <div>
                                    <h4>Clinical History Report</h4>
                                    <p>This is the clinical history report content.</p>
                                </div>
                            </Tab>
                            <Tab eventKey="medications" title="Medications">
                                <div>
                                    <h4>Medications Report</h4>
                                    <p>This is the medications report content.</p>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </Tab>
                <Tab eventKey="lab" title="Lab Results">
                    <div style={{ padding: '15px' }}>
                         <Tabs>
                            <Tab eventKey="hematology" title="Hematology">
                                <div>
                                    <h4>Hematology Report</h4>
                                    <p>This is the hematology report content.</p>
                                </div>
                            </Tab>
                            <Tab eventKey="chemistry" title="Chemistry">
                                <div>
                                    <h4>Chemistry Report</h4>
                                    <p>This is the chemistry report content.</p>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
});
