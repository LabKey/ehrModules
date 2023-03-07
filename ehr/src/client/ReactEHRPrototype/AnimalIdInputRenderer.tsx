import React, { FC, memo } from "react";
import {
    InputRendererProps,
    QuerySelect,
    SchemaQuery,
    ViewInfo,
} from "@labkey/components";

export const AnimalIdInputRenderer: FC<InputRendererProps> = memo(props => {
    const { col, onSelectChange, value, selectInputProps } = props;

    return (
        <QuerySelect
            {...selectInputProps}
            schemaQuery={
                new SchemaQuery(col.lookup.schemaQuery.schemaName, col.lookup.schemaQuery.queryName, ViewInfo.DETAIL_NAME)
            }
            formsy={false}
            valueColumn={'Id'}
            containerClass={'select-input-cell-container'}
            maxRows={25}
            multiple={false}
            onQSChange={onSelectChange}
            value={value}
        />
    )
});