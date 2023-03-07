/*
 * Copyright (c) 2019 LabKey Corporation. All rights reserved. No portion of this work may be reproduced in
 * any form or by any electronic or mechanical means without written permission from LabKey Corporation.
 */
import React, { FC, memo, useCallback, useEffect, useState, ReactNode } from 'react';
import { List, Map } from 'immutable';
import {
    QueryModel,
    withQueryModels,
    EditableGridPanel,
    EditorModelProps,
    EditorModel,
    loadEditorModelData,
    InjectedQueryModels,
    LoadingSpinner,
    Alert,
    resolveErrorMessage,
    QueryConfigMap,
    useDynamicComponentContext
} from '@labkey/components';
import { DynamicLoadingContextConsumer, DynamicLoadingWrapper } from "./DynamicLoadingWrapper";
import DefaultEHRFormButtons from "./buttons/DefaultEHRFormButtons";


interface CustomizableEditableGridProps {
    queryConfigs: QueryConfigMap,
    modelId: string,
    title: string,
    updateId: (id: string) => void
}

const defaultProps = {
    bordered: true,
    striped: true,
    allowAdd: true,
    allowBulkAdd: true,
    allowBulkRemove: true,
    allowBulkUpdate: true,
    bulkAddProps: {
        title: 'Bulk Add'
    }
};


const CustomizableEditableGridBody: FC<InjectedQueryModels & CustomizableEditableGridProps> = memo(props => {
    const { queryModels, modelId, title, updateId, actions } = props;
    const [dataModel, setDataModel] = useState<QueryModel>();
    const [editorModel, setEditorModel] = useState<EditorModel>();
    const [error, setError] = useState<String>();

    const model = queryModels[modelId];

    const { hooks } = useDynamicComponentContext();

    useEffect(() => {
        (async () => {
            if (!model.isLoading && !editorModel) {
                try {
                    const editorModelData = await loadEditorModelData(model);
                    setEditorModel(new EditorModel({
                        id: model.id,
                        ...editorModelData,
                    }));
                    setDataModel(model);
                } catch (err) {
                    console.error(err);
                    setError(resolveErrorMessage(err))
                }
            }
        })();
    }, [model, editorModel]);

    const onGridChange = useCallback((
            editorModelChanges: Partial<EditorModelProps>,
            dataKeys?: List<any>,
            data?: Map<any, Map<string, any>>
        ) => {
            if (dataKeys || data) {
                console.log('test');
            }

            const orderedRows = dataKeys?.toJS();
            const rows = data?.toJS();
            if (orderedRows !== undefined && rows !== undefined) {
                setDataModel((current: QueryModel) => {
                    return current.mutate({ orderedRows, rows })
                });
            }

            setEditorModel((current: EditorModel) => {
                return current.merge(editorModelChanges) as EditorModel;
            });

            if (editorModelChanges?.cellValues?.get('0-0')) {
                updateId(editorModelChanges.cellValues.get('0-0').toJS()[0]?.['raw']);
            }
        },
        [updateId]
    );

    const onDuplicateSelectedRows = (count: number) => {
        if (dataModel.orderedRows !== undefined && dataModel.rows !== undefined) {
            setDataModel((current: QueryModel) => {
                let newRows = {...dataModel.rows};
                let newOrderedRows = [...dataModel.orderedRows];
                for(let i=0; i<count; i++) {
                    newRows = {...newRows, ...dataModel.rows};
                    newOrderedRows = newOrderedRows.concat([...dataModel.orderedRows]);
                }
                return current.mutate({ orderedRows: newOrderedRows, rows: newRows })
            });
        }
    }

    const buttons = useCallback((value: any): ReactNode => {
        const ButtonComponent = value?.["DynamicLoading"].component ? hooks[value["DynamicLoading"].component] : DefaultEHRFormButtons;

        // This needs a key to force re-render of the buttons to pass the latest onSubmit version. This is going outside the normal
        // React lifecycle so useCallback does not work for the onSubmit handler.
        let buttonProps = {onDuplicateSelectedRows: onDuplicateSelectedRows, key: ('custombtns-' + dataModel.rows.length)};
        return React.createElement<any>(ButtonComponent, buttonProps);
    }, [dataModel]);

    if (model?.hasLoadErrors) {
        return <Alert>{model.loadErrors.join(' ')}</Alert>;
    }
    if (!editorModel || !dataModel ) {
        return <LoadingSpinner />
    }
    if (error) {
        return <Alert>{error}</Alert>;
    }

    return (
        <DynamicLoadingWrapper>
            <DynamicLoadingContextConsumer>
                { value =>
                    <EditableGridPanel
                        {...defaultProps}
                        addControlProps={{
                            placement: 'top'
                        }}
                        title={title}
                        model={dataModel}
                        editorModel={editorModel}
                        onChange={onGridChange}
                        customTopButtons={() => {
                            return buttons(value);
                        }}
                    />
                }
            </DynamicLoadingContextConsumer>
        </DynamicLoadingWrapper>
    )
});

export const CustomizableEditableGridWithQueryModels = withQueryModels<{}>(CustomizableEditableGridBody);

export const CustomizableEditableGrid: FC<CustomizableEditableGridProps> = (props) => {
    return (
        <CustomizableEditableGridWithQueryModels autoLoad {...props}/>
    );
};
