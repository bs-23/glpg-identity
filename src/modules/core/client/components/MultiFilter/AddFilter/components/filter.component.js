import React from 'react';
import { Field } from 'formik';
import Input from './input.component';
import Select from 'react-select';

const Filter = (props) => {
    const {
        name,
        index,
        value,
        fieldValue,
        operatorValue,
        filterOptions,
        onChange,
        onRemove
    } = props;

    const type = filterOptions.find(filter => filter.fieldName === fieldValue)?.valueType || 'text';

    const getOptions = () => {
        const filter = filterOptions.find(filter => filter.fieldName === fieldValue);
        const selectOptions = filter && filter.options ? filter.options : [];
        return selectOptions.map(s => ({ label: s.displayText, value: s.value }));
    };

    const getSelectedOptions = () => {
        const selectedOptions = (getOptions()).filter(o => (value || []).some(v => v === o.value));
        return selectedOptions;
    };

    const handleKeyDown = (e) => {
        if (!e.target.value) return;

        if (e.key === 'Enter') {
            onChange(e.target.name, [...value, e.target.value], index);
            const inputElem = document.getElementById(fieldValue + index);
            if (inputElem) {
                setTimeout(() => {
                    inputElem.value = '';
                }, 10);
            }
        }
    };

    const handleSubmit = () => {
        const inputElem = document.getElementById(fieldValue + index);
        if (!inputElem.value) return;
        onChange(inputElem.name, [...value, inputElem.value], index);

        if (inputElem) {
            setTimeout(() => {
                inputElem.value = '';
            }, 10);
        }
    };

    const removeItem = (idx) => {
        const newValues = [...value];
        newValues.splice(idx, 1);
        onChange('value', newValues, index);
    };

    return <div className="pb-3 mb-3 border-bottom">
        <div className="d-flex justify-content-between">
            <div className="mr-2 cdp-text-secondary">Filter {index}</div>
            <i className="fas fa-times mr-2 text-danger" onClick={() => onRemove(index)} />
        </div>
        <div>
            <label className="pt-2 mb-1" for="field">
                Field
            </label>
            <Field
                className="form-control form-control-sm"
                id="field"
                as="select"
                name="fieldName"
                value={fieldValue}
                onChange={(e) => onChange(e.target.name, e.target.value, index)}
            >
                <option className="p-2" value=''> Select an Option </option>
                {filterOptions && filterOptions.map(filter => <option key={filter.fieldName} value={filter.fieldName} >{filter.displayText}</option>)}
            </Field>
        </div>
        <div>
            <label className="pt-2 mb-1" for="operator">
                Operator
            </label>
            <Field
                className="form-control form-control-sm"
                id="operator"
                as="select"
                name="operator"
                value={operatorValue}
                onChange={(e) => onChange(e.target.name, e.target.value, index)}
            >
                <>
                    <option className="p-2" value=''> Select an Option </option>
                    {filterOptions && filterOptions.find(filter => filter.fieldName === fieldValue)?.operators?.map(item => <option key={item.key} value={item.key} >{item.displayText}</option>)}
                </>
            </Field>
        </div>
        <div>
            <label className="pt-2 mb-1" for="value">
                Value
            </label>
            {/* <Field
                className="form-control form-control-sm"
                id="value"
                name="value"
                value={value}
                onChange={(e) => onChange(e, index)}
            ></Field> */}
            {type === 'select' &&
                <Select
                    defaultValue={[]}
                    isMulti={true}
                    name={fieldValue}
                    hideSelectedOptions={false}
                    options={getOptions()}
                    className="multiselect"
                    classNamePrefix="multiselect"
                    value={getSelectedOptions()}
                    onChange={selectedOption => {
                        const value = selectedOption.map(o => o.value);
                        onChange('value', value, index);
                    }}
                />
            }

            {type === 'text' &&
                <div>
                    {value && value.map((v, i) => (
                        <span className="pr-1 pl-1 mr-1 bg-secondary rounded" key={'val-' + i}>{v} <span className="rounded bg-danger" onClick={() => removeItem(i)}>x</span></span>
                    ))}
                    <Input
                        className="form-control form-control-sm"
                        id={fieldValue + index}
                        name="value"
                        type='text'
                        onKeyDown={handleKeyDown} />
                    <button className="mt-1" onClick={handleSubmit}>Add more</button>
                </div>
            }

            {type !== 'text' && type !== 'select' &&
                <Input
                    className="form-control form-control-sm"
                    id="value"
                    name="value"
                    value={value}
                    type={type}
                    onChange={(e) => onChange(e.target.name, [...value, e.target.value], index)} />
            }
        </div>
    </div>
}

export default Filter;
