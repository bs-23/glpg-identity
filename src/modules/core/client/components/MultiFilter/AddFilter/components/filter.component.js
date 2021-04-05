import React from 'react';
import { Field } from 'formik';
import Input from './input.component';
import Select from 'react-select';
import { WithContext as ReactTags } from 'react-tag-input';

const selectStyles = {
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    menu: provided => ({ ...provided, zIndex: "9999 !important" })
};
const Filter = (props) => {
    const {
        title,
        index,
        filter,
        filterOptions,
        isTouched,
        validationError,
        maxNumberOfValues,
        onChange,
        onRemove
    } = props;

    const { value, fieldName, operator } = filter;

    const type = filterOptions.find(filter => filter.fieldName === fieldName)?.valueType || 'text';

    const filterOption = filterOptions.find(fo => fo.fieldName === fieldName) || {};

    const getOptions = () => {
        const filter = filterOptions.find(filter => filter.fieldName === fieldName);
        const selectOptions = filter && filter.options ? filter.options : [];
        return selectOptions.map(s => ({ label: s.displayText, value: s.value }));
    };

    const getSelectedOptions = () => {
        const selectedOptions = (getOptions()).filter(o => (value || []).some(v => v === o.value));
        return selectedOptions;
    };

    const handleDelete = (i) => {
        const newValues = [...value];
        newValues.splice(i, 1);
        onChange('value', newValues, index);
    };

    const handleAddition = (tag) => {
        if (value.length === maxNumberOfValues) return;
        if(!tag.text.trim()) return;
        onChange('value', [...value, tag.text.trim()], index);
    };

    const handleInputBlur = (tagText) => {
        if (tagText && tagText.trim()) onChange('value', [...value, tagText.trim()], index);
    };

    const getTags = () => {
        return (value || []).map(v => ({ id: v, text: v }));
    };

    const handleFilterChange = (e) => {
        const inputType = e.target.type;
        if(inputType === 'date') {
            onChange(e.target.name, e.target.value, index);
        }
        else onChange(e.target.name, [...value, e.target.value], index);
    }

    return <div className="pb-3 mb-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
            <div className="mr-2 cdp-text-secondary">Filter {title}</div>
            <i className="fas fa-times mr-2 cdp-text-secondary-lighter cursor-pointer" onClick={() => onRemove(index)} />
        </div>
        <div>
            <label className="pt-2 mb-1 small font-weight-bold" for="field">
                Field
            </label>
            <Field
                className="form-control form-control-sm"
                id="field"
                as="select"
                name="fieldName"
                value={fieldName}
                onChange={(e) => onChange(e.target.name, e.target.value, index)}
            >
                <option className="p-2" value=''> Select an Option </option>
                {filterOptions && filterOptions.map(filter => <option key={filter.fieldName} value={filter.fieldName} >{filter.displayText}</option>)}
            </Field>
            {isTouched && <div className="invalid-feedback">{validationError.fieldName}</div>}
        </div>
        <div>
            <label className="pt-2 mb-1 small font-weight-bold" for="operator">
                Operator
            </label>
            <Field
                className="form-control form-control-sm"
                id="operator"
                as="select"
                name="operator"
                value={operator}
                onChange={(e) => onChange(e.target.name, e.target.value, index)}
            >
                <>
                    <option className="p-2" value=''> Select an Option </option>
                    {filterOptions && filterOptions.find(filter => filter.fieldName === fieldName)?.operators?.map(item => <option key={item.key} value={item.key} >{item.displayText}</option>)}
                </>
            </Field>
            {isTouched && <div className="invalid-feedback">{validationError.operator}</div>}
        </div>
        <div>
            <label className="pt-2 mb-1 small font-weight-bold" for="value">
                Value
            </label>

            {type === 'select' &&
                <React.Fragment>
                    <Select
                        defaultValue={[]}
                        isMulti={true}
                        name={fieldName}
                        hideSelectedOptions={false}
                        options={getOptions()}
                        className="multiselect"
                        classNamePrefix="multiselect"
                        closeMenuOnScroll={false}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        value={getSelectedOptions()}
                        onChange={selectedOption => {
                            if (selectedOption && selectedOption.length > maxNumberOfValues) return;

                            const value = (selectedOption || []).map(o => o.value);
                            const displayText = (selectedOption || []).map(o => o.label);

                            onChange('value', value, index);
                            onChange('displayText', displayText, index);
                        }}
                    />
                    {isTouched && <div className="invalid-feedback">{validationError.value}</div>}
                </React.Fragment>
            }

            {type === 'text' &&
                <div>
                    <ReactTags
                        tags={getTags()}
                        delimiters={[13]} // key codes for Enter
                        handleDelete={handleDelete}
                        handleAddition={handleAddition}
                        handleInputBlur={handleInputBlur}
                        autofocus={false}
                        maxLength={filterOption.maxLength}
                        ref={ref => {
                            if (ref && ref.ref.current) {
                                if (value.length >= maxNumberOfValues) ref.ref.current.textInput.setAttribute("disabled", true);
                                else ref.ref.current.textInput.removeAttribute("disabled");
                            }
                        }}
                    />
                    {isTouched && <div className="invalid-feedback">{validationError.value}</div>}
                </div>
            }

            {type !== 'text' && type !== 'select' &&
                <React.Fragment>
                    <Input
                        className="form-control form-control-sm"
                        id="value"
                        name="value"
                        value={value}
                        type={type}
                        onChange={handleFilterChange}
                    />
                    {isTouched && <div className="invalid-feedback">{validationError.value}</div>}
                </React.Fragment>
            }
        </div>
    </div>
}

export default Filter;
