/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as actions from './actions'
interface SchemaQueryParamsProps {
    editable?: boolean
}

interface SchemaQueryProps {
    params?: SchemaQueryParamsProps
    queryName?: string
    schemaName?: string
    viewName?: string
}

export class SchemaQuery implements SchemaQueryProps {
    params?: SchemaQueryParamsProps = {editable: false};
    queryName?: string = undefined;
    schemaName?: string = undefined;
    viewName?: string = undefined;

    static create(schemaName: string, queryName: string, viewName?: string, params?: SchemaQueryParamsProps): SchemaQuery {
        return new SchemaQuery({schemaName, queryName, viewName, params});
    }

    constructor(props?: Partial<SchemaQuery>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }

    resolveKey(): string {
        let key = [this.schemaName, this.queryName].join('|');

        if (this.viewName != undefined) {
            key = [key, this.viewName].join('|');
        }

        return key.toLowerCase();
    }
}

export interface LabKeyQueryRowPropertyProps {
    displayValue?: string
    url?: string
    value: any
}

interface LabKeyQueryColumnModelProps {
    align: string
    dataIndex: string
    editable: boolean
    header: string
    hidden: boolean
    required: boolean
    scale: number
    sortable: boolean
    width: number
}

export interface LabKeyQueryFieldProps {
    align: string
    autoIncrement: boolean
    calculated: boolean
    caption: string
    cols: number
    conceptURI: any
    defaultScale: string
    defaultValue: any
    dimension: boolean
    excludeFromShifting: boolean
    facetingBehaviorType: string
    fieldKey: {
        name: string
        parent: any
    }
    friendlyType: string
    hidden: boolean
    inputType: string
    jsonType: string
    keyField: boolean
    measure: boolean
    mvEnabled: boolean
    nullable: boolean
    phi: string
    protected: boolean
    readOnly: boolean
    recommendedVariable: boolean
    scale: number
    selectable: boolean
    shortCaption: string
    shownInDetailsView: boolean
    shownInInsertView: boolean
    shownInUpdateView: boolean
    sortable: boolean
    sqlType: string
    type: string
    userEditable: boolean
    versionField: boolean
    width: number
}

export interface LabKeyQueryMetaDataProps {
    description: string
    fields: Array<LabKeyQueryFieldProps>
    id: string
    importMessage: string
    importTemplates: Array<{label: string, url: string}>
    root: string
    title: string
    totalProperty: string
}

export interface LabKeyQueryResponse {
    columnModel?: Array<LabKeyQueryColumnModelProps>
    metaData?: LabKeyQueryMetaDataProps
    queryName: string
    rowCount: number
    rows: Array<{[key: string]: LabKeyQueryRowPropertyProps}>
    schemaKey: {name: string, parent: any}
    schemaName: Array<string> | string
}

export interface QueryColumn {
    align: string;
    autoIncrement: boolean;
    calculated: boolean;
    caption: string;
    conceptURI: string;
    defaultScale: string;
    defaultValue: any;
    description?: string;
    dimension: boolean;
    displayAsLookup?: boolean;
    excludeFromShifting: boolean;
    ext: any;
    facetingBehaviorType: string;
    fieldKey: string;
    fieldKeyArray: Array<string>;
    fieldKeyPath: string;
    format: string;
    friendlyType: string;
    hidden: boolean;
    inputType: string;
    isAutoIncrement: boolean; // DUPLICATE
    isHidden: boolean; // DUPLICATE
    isKeyField: boolean;
    isMvEnabled: boolean;
    isNullable: boolean;
    isReadOnly: boolean;
    isSelectable: boolean; // DUPLICATE
    isUserEditable: boolean; // DUPLICATE
    isVersionField: boolean;
    jsonType: string;
    keyField: boolean;
    measure: boolean;
    mvEnabled: boolean;
    name: string;
    nullable: boolean;
    phi: string;
    rangeURI: string;
    readOnly: boolean;
    recommendedVariable: boolean;
    required: boolean;
    selectable: boolean;
    shortCaption: string;
    shownInDetailsView: boolean;
    shownInInsertView: boolean;
    shownInUpdateView: boolean;
    sortable: boolean;
    sqlType: string;
    type: string;
    userEditable: boolean;
    versionField: boolean;
}

interface QueryInfoProps {
    canEdit: boolean;
    canEditSharedViews: boolean;
    columns: Array<QueryColumn>;
    createDefinitionUrl?: string;
    defaultView?: {columns: Array<QueryColumn>}
    description?: string;
    editDefinitionUrl?: string;
    iconURL?: string;
    importTemplates: Array<any>;
    indices: {[key: string]: any};
    insertUrl: string;
    isInherited: boolean;
    isMetadataOverrideable: boolean;
    isTemporary: boolean;
    isUserDefined: boolean;
    name: string;
    schemaName: string;
    targetContainers: Array<any>;
    title: string;
    titleColumn: string;
    viewDataUrl: string;
    views: Array<any>;
    schemaLabel: string;
    showInsertNewButton: boolean;
    importUrlDisabled: boolean;
    importUrl: boolean;
    insertUrlDisabled: boolean;
}

export class QueryInfo implements QueryInfoProps {
    canEdit: boolean = false;
    canEditSharedViews: boolean = false;
    columns: Array<QueryColumn> = [];
    createDefinitionUrl?: string = undefined;
    defaultView?: {columns: Array<QueryColumn>} = {columns: []};
    description?: string = undefined;
    editDefinitionUrl?: string = undefined;
    iconURL?: string = undefined;
    importTemplates: Array<any> = [];
    indices: {[key: string]: any} = {};
    insertUrl: string = undefined;
    isInherited: boolean = false;
    isMetadataOverrideable: boolean = false;
    isTemporary: boolean = false;
    isUserDefined: boolean = false;
    name: string = undefined;
    schemaName: string = undefined;
    targetContainers: Array<any> = [];
    title: string = undefined;
    titleColumn: string = undefined;
    viewDataUrl: string = undefined;
    views: Array<any> = [];
    schemaLabel: string = undefined;
    showInsertNewButton: boolean = false;
    importUrlDisabled: boolean = false;
    importUrl: boolean = false;
    insertUrlDisabled: boolean = false;

    constructor(props?: Partial<QueryInfo>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }

}

export interface QueryModelProps {
    id: string
    query?: string
    requiredColumns?: Array<string>
    schemaQuery?: SchemaQuery
    schema?: string
    view?: string

    data?: {[key: string]: LabKeyQueryRowPropertyProps}
    dataCount?: number
    dataIds?: Array<number>
    filters?: Array<any> // define filter type
    isError?: boolean
    isLoaded?: boolean
    isLoading?: boolean
    message?: string
    metaData?: LabKeyQueryMetaDataProps
    queryInfo?: QueryInfo // define queryInfo
}

export class QueryModel implements QueryModelProps {
    id: string = undefined;
    query?: string = undefined;
    requiredColumns?: Array<string> = [];
    schemaQuery?: SchemaQuery = new SchemaQuery();
    schema?: string = undefined;
    view?: string = undefined;

    data?: {[key: string]: LabKeyQueryRowPropertyProps} = {};
    dataCount?: number = 0;
    dataIds?: Array<number> = [];
    filters?: Array<any> = []; // define filter type
    isError?: boolean = false;
    isLoaded?: boolean = false;
    isLoading?: boolean = false;
    message?: string = undefined;
    metaData?: LabKeyQueryMetaDataProps = {} as LabKeyQueryMetaDataProps;
    queryInfo?: QueryInfo = new QueryInfo();

    constructor(props?: Partial<QueryModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }

    init() {
        return actions.init(this);
    }

    load() {
        return actions.load(this);
    }

    getColumn(columnName: string) {
        if (this.metaData) {
            return this.metaData.fields.filter((field: LabKeyQueryFieldProps) => {
                if (field.fieldKey && field.fieldKey.name) {
                    return field.fieldKey.name === columnName;
                }
            });
        }

        return [];
    }

    getKeyColumn(): Array<LabKeyQueryFieldProps> {
        if (this.metaData) {
            return this.metaData.fields.filter((field: LabKeyQueryFieldProps) => {
                return field.keyField;
            });
        }

        return [];
    }

    getRequiredColumns(): string | Array<string> {
        return this.requiredColumns.length ? this.requiredColumns : '*';
    }

    // TODO: add a fetch for LABKEY.Query.getQueryDetails and populate a queryInfo field instead of metaData
    getVisibleColumns(): Array<LabKeyQueryFieldProps> {
        if (this.metaData) {
            return this.metaData.fields.filter((field: LabKeyQueryFieldProps) => {
                return field.shownInDetailsView;
            });
        }

        return [];
    }

    getVisibleColumnNames(): Array<string> {
        return this.getVisibleColumns().map(col => col.caption);
    }
}

interface EditableQueryModelProps extends QueryModelProps {
    initialData?: {[key: string]: LabKeyQueryRowPropertyProps}
    initialDataCount: number
    initialIds?: Array<number>
    isSubmitting?: boolean
    isSubmitted?: boolean
}

export class EditableQueryModel implements EditableQueryModelProps {
    id: string = undefined;
    schemaQuery: SchemaQuery = new SchemaQuery();
    schema: string = undefined;
    query: string = undefined;

    data: {[key: string]: LabKeyQueryRowPropertyProps} = {};
    dataCount: number = 0;
    dataIds: Array<number> = [];
    filters: Array<any> = []; // define filter type
    isError: boolean = false;
    isLoaded: boolean = false;
    isLoading: boolean = false;
    message: string = undefined;
    metaData: LabKeyQueryMetaDataProps = {} as LabKeyQueryMetaDataProps;
    queryInfo: any = new QueryInfo();

    // added props
    initialData: {[key: string]: LabKeyQueryRowPropertyProps} = {};
    initialDataCount: number = 0;
    initialIds: Array<number> = [];
    isSubmitting: boolean = false;
    isSubmitted: boolean = false;

    constructor(props?: Partial<EditableQueryModel>) {
        // todo: make version that holds data internally and does not rely on reduxForm
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }

    addRow() {
        return actions.queryEditAddRow(this);
    }

    hasAdded(): boolean {
        return this && this.dataCount > this.initialDataCount;
    }

    hasRemoved(): boolean {
        // if the current count is lower than our initial count, model hasRemoved,
        // otherwise check if the initialIds are all still in current Ids

        return this && this.dataCount < this.initialDataCount ||
            this.initialIds.some((id) => {
                return this.dataIds.indexOf(id) === -1;
            });
    }

    getRemoved(): Array<{[key: string]: any}> {
        return actions.getRemoved(this.initialIds, this.dataIds, this.metaData.id);
    }

    getRequiredInsertColumns(): Array<QueryColumn> {
        if (this.queryInfo) {
            return this.queryInfo.columns
                .filter(c => c.shownInInsertView && c.required);
        }

        return [];
    }

    removeRow(rowId: number) {
        return actions.queryEditRemoveRow(this, rowId);
    }

    setSubmitted() {
        return actions.queryEditSetSubmitted(this);
    }

    setSubmitting() {
        return actions.queryEditSetSubmitting(this);
    }
}



export interface QueryModelsProps {
    editableModels: {[key: string]: EditableQueryModel}
    models: {[key: string]: QueryModel}
    loadedQueries: Array<string>
    loadingQueries: Array<string>
}

export class QueryModelsContainer implements QueryModelsProps {
    editableModels: {[key: string]: EditableQueryModel} = {};
    models: {[key: string]: QueryModel} = {};
    loadedQueries: Array<string> = [];
    loadingQueries: Array<string> = [];

    constructor(props?: Partial<QueryModelsContainer>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}