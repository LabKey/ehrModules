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
import * as React from 'react';

interface SearchInputProps {
    allowClear?: boolean
    allowToggle?: boolean
    disabled?: boolean
    handleClear?: any
    handleFocus?: (el: React.FocusEvent<HTMLInputElement>) => void
    handleInputChange?: (input) => any
    handleToggle?: () => void
    input?: string
    inputClassName?: string
    inputRef?: any
    name: string
    toggled?: boolean
    wrapperClassName?: string
}


export class SearchInput extends React.Component<SearchInputProps, {}> {

    static defaultProps = {
        allowClear: true,
        allowToggle: false,
        disabled: false,
        toggled: false,
        wrapperClassName: 'col-xs-6',
    };

    handleFocus(el: React.FocusEvent<HTMLInputElement>) {
        const { handleFocus } = this.props;
        if (handleFocus && typeof handleFocus === 'function') {
            handleFocus(el);
        }

    }

    handleToggle() {
        const { handleToggle } = this.props;
        if (handleToggle && typeof handleToggle === 'function') {
            handleToggle();
        }
    }

    renderToggle() {
        const { allowToggle, toggled } = this.props;

        if (allowToggle) {
            return <i className={'searchinput-caret fa-caret-' + (toggled ? 'down' : 'right')} onClick={() => this.handleToggle()}/>;
        }

        return null;
    }

    render() {
        const {
            allowClear,
            disabled,
            handleClear,
            handleInputChange,
            input,
            inputClassName,
            inputRef,
            name,
            wrapperClassName
        } = this.props;

        return (
            <div className={wrapperClassName}>
                <i className="fa fa-search searchinput-icon"/>
                {allowClear && input !== '' && (
                    <i className="fa fa-times-circle searchinput-clear" onClick={handleClear}/>
                )}
                {this.renderToggle()}
                <input
                    className={['searchinput-search', inputClassName].join(' ')}
                    disabled={disabled}
                    name={name}
                    onChange={handleInputChange}
                    onFocus={(el: React.FocusEvent<HTMLInputElement>) => this.handleFocus(el)}
                    ref={inputRef}
                    type="text"
                    value={input ? input : ''}/>
            </div>
        );
    }
}