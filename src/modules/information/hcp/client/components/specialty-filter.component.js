import React, { useState, useEffect } from 'react';
import { Field } from 'formik';
import Select from 'react-select';
import { useSelector, useDispatch } from 'react-redux';
import { getHCPSpecialities } from '../hcp.actions';

const SpecialtyFilter = (props) => {
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

    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const specialties = useSelector(state => state.hcpReducer.specialties);
    const countries = useSelector(state => state.countryReducer.countries);
    const dispatch = useDispatch();

    const { value, fieldName, operator } = filter;

    const currentFilterOption = filterOptions.find(fo => fo.fieldName === fieldName);

    const getCountryOptions = () => {
        const countryOptions = countries.map(c => ({ label: c.codbase_desc, value: c.country_iso2 }));
        return countryOptions;
    }

    const getSelectedCountry = () => {
        const country = countries.find(c => c.country_iso2 === filter.country);
        if (!country) return [];
        return { value: country.country_iso2, label: country.codbase_desc };
    }

    const getSelectedOptions = () => {
        const selectedOptions = currentFilterOption.getOptions({ country: filter.country }).filter(o => (value || []).some(v => v === o.value));
        return selectedOptions;
    };

    useEffect(() => {
        // console.log('Refetching sp......................')
        if(filter.country) {
            dispatch(getHCPSpecialities(filter.country, 'en'));
            setSelectedSpecialties(getSelectedOptions());
        }
    }, [filter.country]);

    useEffect(() => {
        setSelectedSpecialties(getSelectedOptions());
    }, [specialties, value])

    return <div className="pb-3 mb-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
            <div className="mr-2 cdp-text-secondary">Filter {title}</div>
            <i className="fas fa-times mr-2 cdp-text-secondary-lighter" type="button" onClick={() => onRemove(index)} />
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
                Country
            </label>

            <React.Fragment>
                <Select
                    defaultValue={[]}
                    isMulti={false}
                    hideSelectedOptions={false}
                    options={getCountryOptions()}
                    className="multiselect"
                    classNamePrefix="multiselect"
                    value={getSelectedCountry()}
                    closeMenuOnScroll={false}
                    menuPortalTarget={document.body}
                    onChange={({ value }) => {
                        onChange('country', value, index);
                        onChange('value', [], index);
                    }}
                />
                {isTouched && getSelectedCountry().length === 0 &&
                    <div className="invalid-feedback">Field can not be empty.</div>
                }
            </React.Fragment>
        </div>
        <div>
            <label className="pt-2 mb-1 small font-weight-bold" for="value">
                Value
            </label>

            <React.Fragment>
                <Select
                    defaultValue={[]}
                    isMulti
                    name={fieldName}
                    options={currentFilterOption.getOptions({ country: filter.country })}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    menuPortalTarget={document.body}
                    value={selectedSpecialties}
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
        </div>
    </div>
}

export default SpecialtyFilter;
