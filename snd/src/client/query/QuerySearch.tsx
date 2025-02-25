/*
 * Copyright (c) 2017 LabKey Corporation
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
import * as React from 'react';
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import * as actions from './actions'

import { QueryModel, SchemaQuery } from './model'
import {getStateQueryModel} from "./actions";

export interface QuerySearchOwnProps {
    id?: string

    modelProps?: any
    name?: string
    schemaQuery: SchemaQuery
    // todo: support filters, etc
}

interface QuerySearchState {
    model?: QueryModel
    queryState?: any
}

interface QuerySearchDispatch {
    dispatch?: Dispatch<any>
    initModel: (model: QueryModel) => any
}

type QuerySearchProps = QuerySearchOwnProps & QuerySearchState & QuerySearchDispatch;


function mapStateToProps(state: APP_STATE_PROPS, ownProps: QuerySearchOwnProps): QuerySearchState {
    const { id, schemaQuery, modelProps } = ownProps;

    if (id) {
        return {
            model: actions.getStateQueryModel(state.queries, id, schemaQuery, modelProps),
            queryState: state.queries
        }
    }
    return {
        model: state.queries.models[schemaQuery.resolveKey()],
    }
}

function mapDispatchToProps(dispatch: Dispatch<any>): QuerySearchDispatch {
    return {
        initModel: (model: QueryModel) => dispatch(model.init()),
    }

}
// Wrapper
export class QuerySearchWrapperImpl extends React.Component<QuerySearchProps, {}> {

    static defaultProps = {
        model: new QueryModel(),
    };

    constructor(props?: QuerySearchProps) {
        super(props);
    }

    componentDidMount() {
        this.initModel(this.props);
    }

    componentWillReceiveProps(nextProps?: QuerySearchProps) {
        this.initModel(nextProps);
    }

    getModel(props: QuerySearchProps) {
        const { id, model, modelProps, queryState, schemaQuery } = props;
        if (model) {
            return model;
        }

        return getStateQueryModel({queries: queryState}, id, schemaQuery, modelProps);
    }

    initModel(props: QuerySearchProps) {
        const { id } = props;

        if (id) {
            const model = this.getModel(props);
            this.props.initModel(model);
        }
    }

    render() {
        const { model } = this.props;
        if (model && model.isLoaded && React.Children.count(this.props.children)) {
            return (
                <div className='query-search--container'>
                    {React.Children.map(this.props.children, (child: React.ReactElement<any>, index) => {
                        return React.cloneElement(child, {...this.props})
                    })}
                </div>
            )
        }

        else if (model && model.isLoading) {
            return (
                <div className='query-search--container'>
                    <i className="fa fa-spinner fa-spin fa-fw"/> Loading...
                </div>
            );
        }

        return null;
    }
}


export const QuerySearch = connect<QuerySearchState, QuerySearchDispatch, QuerySearchOwnProps>(
    mapStateToProps,
    mapDispatchToProps
)(QuerySearchWrapperImpl);