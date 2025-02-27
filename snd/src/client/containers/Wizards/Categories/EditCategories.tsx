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
import { Button, Modal, Panel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { push } from 'react-router-redux'
import { Form, FormProps, Field, reduxForm } from 'redux-form';

import * as actions from '../../../query/actions'
import { QuerySearch } from '../../../query/QuerySearch'
import { EditableQueryModel, LabKeyQueryRowPropertyProps, QueryModel } from '../../../query/model'
import { EDITABLE_CAT_SQ } from '../../Packages/constants'

import { FieldCheckboxInput } from '../../../components/Form/Checkbox'
import { FieldTextInput } from '../../../components/Form/TextInput'

import { saveCategoryChanges } from './actions'

export class EditCategories extends React.Component<RouteComponentProps<any>, any> {
    render() {
        return (
            <Panel>
                <h4 style={{marginTop: '0'}}>Edit Package Categories</h4>
                <QuerySearch
                    id='EditCategories'
                    schemaQuery={EDITABLE_CAT_SQ}>
                    <EditCategoriesForm/>
                </QuerySearch>
            </Panel>
        );
    }
}

const EditColumns = [ // this should actually be based on model queryInfo req. columns
    {
        component: FieldTextInput,
        disabled: true,
        name: 'CategoryId',
        label: 'Code',
        width: '1fr',
        flex: 0.5
    },
    {
        component: FieldTextInput,
        name: 'Description',
        disabled: false,
        label: 'Description',
        width: '3fr',
        flex: 3
    },
    {
        component: FieldCheckboxInput,
        disabled: false,
        label: 'Active',
        name: 'Active',
        width: '0.5fr',
        flex: 0.5
    },
    {
        component: FieldTextInput,
        disabled: true,
        name: 'InUse',
        label: 'In Use',
        width: '1fr',
        flex: 0.5
    },
];

const ULStyle: React.CSSProperties = {
    alignContent: "flex-start",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    listStyle: "none",
    margin: '0',
    padding: "5px"
};

const ULHeaderStyle = Object.assign({}, ULStyle, {borderBottom: '2px solid lightgray', marginBottom: '5px'});


interface EditCategoriesState extends FormProps<any, any, any> {
    editableModel?: EditableQueryModel
    dispatch?: any
}

interface EditCategoriesOwnProps {
    model?: QueryModel
}

type EditCategoriesProps = EditCategoriesState & EditCategoriesOwnProps;

interface EditCategoriesStateProps {
    hasRemoved?: boolean
    formValues?: any
}

function mapStateToProps(state: APP_STATE_PROPS, ownProps:  EditCategoriesOwnProps): EditCategoriesState {
    const { model } = ownProps;

    const editableModel = state.queries.editableModels[model.id];

    return {
        editableModel,
        initialValues: editableModel ? editableModel.data : undefined
    };
}

// make this more HOC
export class EditCategoriesImpl extends React.Component<EditCategoriesProps, EditCategoriesStateProps> {

    static checkEnabled(dirty: boolean, editableModel: EditableQueryModel) {
        if (dirty === true) {
            // if form is dirty, allow submit
            return true;
        }

        // if row has been removed, also allow submit
        return editableModel && editableModel.hasRemoved();
    }

    constructor(props) {
        super(props);

        this.state = {
            hasRemoved: false,
            formValues: undefined
        };

        this.handleAdd = this.handleAdd.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleHasRemoved = this.toggleHasRemoved.bind(this);
    }

    componentDidMount() {
        this.initModel(this.props);
    }

    componentWillReceiveProps(nextProps: EditCategoriesProps) {
        this.initModel(nextProps);
    }

    handleAdd() {
        const { dispatch, editableModel } = this.props;
        dispatch(editableModel.addRow());
    }

    handleCancel() {
        const { dispatch } = this.props;
        dispatch(push('/packages'))
    }

    handleDelete(rowId: number) {
        const { dispatch, editableModel } = this.props;
        dispatch(editableModel.removeRow(rowId));
    }

    handleSave(values) {
        const { dispatch, editableModel } = this.props;
        dispatch(saveCategoryChanges(editableModel, values));
    }

    handleSubmit(values) {
        const { editableModel } = this.props;
        if (editableModel.hasRemoved()) {
            this.saveFormValues(values);
            this.toggleHasRemoved();
        }
        else {
            this.handleSave(values);
        }
    }

    initModel(props: EditCategoriesProps) {
        const { dispatch, model } = props;
        dispatch(actions.queryEditInitModel(model));
    }

    toggleHasRemoved() {
        const { hasRemoved } = this.state;
        this.setState({
            hasRemoved: !hasRemoved
        });
    }

    renderButtons() {
        const { editableModel, dirty } = this.props;

        const submitEnabled = EditCategoriesImpl.checkEnabled(dirty, editableModel);

        return (
            <div>
                <div className="buttons clearfix" style={{padding: '0 5px', marginBottom: '15px'}}>
                    <div className="pull-left" onClick={this.handleAdd} style={{cursor: 'pointer'}}>
                        <i className="fa fa-plus-circle" style={{color: '#5cb85c'}}/> Add Category
                    </div>

                </div>
                <div className="buttons clearfix" style={{padding: '0 5px'}}>
                    <div className="btn-group pull-left">
                        <Button onClick={this.handleCancel}>Cancel</Button>
                        <Button disabled={!submitEnabled} type='submit'>Save</Button>
                    </div>
                </div>
            </div>
        )
    }

    renderDataRows() {
        const { editableModel } = this.props;

        if (editableModel && editableModel.dataCount) {

            return editableModel.dataIds.map((id) => {
                const data = editableModel.data[id];

                return <EditCategoryRow data={data} handleClick={this.handleDelete} id={id} key={id}/>;
            });
        }

        return <div style={{padding: "5px"}}>No Categories found.</div>;
    }

    renderMessage() {
        const { editableModel } = this.props;

        if (editableModel && editableModel.isSubmitting) {
            return (
                <div className="static-modal">
                    <Modal onHide={() => null} show={editableModel.isSubmitting}>
                        <Modal.Body>
                            <i className="fa fa-spinner fa-spin fa-fw"/> Submitting Edits
                        </Modal.Body>
                    </Modal>
                </div>
            )
        }
    }

    renderDeleteRowsWarning() {
        const { editableModel } = this.props;
        const { hasRemoved, formValues } = this.state;

        if (editableModel && hasRemoved) {
            const removed = editableModel.getRemoved().map(r => r['CategoryId']);
            return (
                <div className="static-modal">
                    <Modal onHide={this.toggleHasRemoved} show={editableModel && hasRemoved}>
                        <Modal.Body>
                            Are you sure you want to delete row{removed.length > 1 ? 's' : ''} {removed.join(', ')}?
                        </Modal.Body>
                        <Modal.Footer>
                            <div className="btn-group">
                                <Button onClick={this.toggleHasRemoved}>Cancel</Button>
                                <Button onClick={() => this.handleSave(formValues)}>Submit Changes</Button>
                            </div>
                        </Modal.Footer>
                    </Modal>
                </div>
            )
        }
    }

    saveFormValues(formValues) {
        this.setState({
            formValues
        });
    }

    render() {
        const { error, handleSubmit } = this.props;

        return (
            <div style={{padding: '10px'}}>
                {error ?
                    <div className='alert alert-danger' role='alert'>{error}</div>
                    : null}
                {this.renderDeleteRowsWarning()}
                {this.renderMessage()}
                <Form onSubmit={handleSubmit(this.handleSubmit)}>
                    <div className='categories-container clearfix' style={{marginBottom: '10px'}}>
                        <ul className='categories-header' style={ULHeaderStyle}>
                            <li style={{flex: 0.1}}/>
                            {EditColumns.map((col, i) => {
                                return (
                                    <li key={col.label + i} style={{flex: col.flex, paddingLeft: '5px'}}>
                                        <strong>{col.label}</strong>
                                    </li>
                                )
                            })}
                        </ul>
                        {this.renderDataRows()}
                    </div>
                    {this.renderButtons()}
                </Form>
            </div>
        )

    }
}

const EditCategoriesWrap = reduxForm({
    enableReinitialize: true,
    form: 'editCategories'
})(EditCategoriesImpl);

const EditCategoriesForm = connect(mapStateToProps)(EditCategoriesWrap);

interface EditCategoryRowProps {
    data?: LabKeyQueryRowPropertyProps
    id: number
    handleClick?: (id) => void
}

interface EditCategoryRowState {
    isHover?: boolean
}


export class EditCategoryRow extends React.Component<EditCategoryRowProps, EditCategoryRowState> {
    constructor(props: EditCategoryRowProps) {
        super(props);

        this.state = {
            isHover: false
        };

        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleMouseEnter() {
        this.setState({
            isHover: true
        });
    }

    handleMouseLeave() {
        this.setState({
            isHover: false
        });
    }

    render() {
        const { data, handleClick, id } = this.props;
        const { isHover } = this.state;
        const inUse = data && data['InUse']['value'] === 'true';

        const removeStyle = {
            width: '100%',
            height: '100%',
            textAlign: 'center',
            lineHeight: '27px',
            color: 'white',
            cursor: 'pointer'
        };

        return (
            <ul style={Object.assign({}, ULStyle, {background: isHover ? '#3495d2' : ''})} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                <li style={{flex: 0.1}}>
                    {isHover && !inUse ?
                        <i className='fa fa-times' style={removeStyle} onClick={() => handleClick(id)}/>
                        : null}
                </li>
                {EditColumns.map((col, i) => {

                    const disabled = col.label === 'Active' && inUse ? true : col.disabled;
                    return (
                        <li key={col.label + i} style={{flex: col.flex, paddingLeft: '5px'}}>
                            <Field
                                component={col.component}
                                disabled={disabled}
                                name={id + '[' + col.name + ']' + '[value]'}/>
                        </li>
                    )
                })}

            </ul>
        )
    }
}