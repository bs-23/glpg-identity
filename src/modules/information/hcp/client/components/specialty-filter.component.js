import React, { useState, useEffect } from 'react';
import { Field } from 'formik';
import Select from 'react-select';
import { useSelector, useDispatch } from 'react-redux';
import { getHCPSpecialities } from '../hcp.actions';

const SpecialtyFilter = (props) => {
    const {
        title,
        index,
        value,
        fieldValue,
        operatorValue,
        filterOptions,
        isTouched,
        validationError,
        onChange,
        onRemove
    } = props;

    const [selectedCountry, setSelectedCountry] = useState(null);
    const countries = useSelector(state => state.countryReducer.countries);
    const specialties = useSelector(state => state.hcpReducer.specialties);
    const dispatch = useDispatch();

    const getCountryOptions = () => {
        const countryOptions = countries.map(c => ({ label: c.codbase_desc, value: c.country_iso2 }));
        return countryOptions;
    }

    const getSelectedCountry = () => {
        const country = countries.find(c => c.country_iso2 === selectedCountry);
        if (!country) return [];
        return { value: country.country_iso2, label: country.codbase_desc };
    }

    const getSpecialtyOptions = () => {
        if(!selectedCountry) return [];
        const countryLocaleCode = `${selectedCountry.toLowerCase()}_en`;
        const specialtiesForSelectedCountry = specialties[countryLocaleCode] || [];
        const specialtyOptions = specialtiesForSelectedCountry.map(s => ({ value: s.cod_id_onekey, label: s.cod_description  }));
        return specialtyOptions;
    };

    const getSelectedOptions = () => {
        const selectedOptions = getSpecialtyOptions().filter(o => (value || []).some(v => v === o.value));
        return selectedOptions;
    };

    useEffect(() => {
        if(selectedCountry) dispatch(getHCPSpecialities(selectedCountry, 'en'));
    }, [selectedCountry]);

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
                value={fieldValue}
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
                value={operatorValue}
                onChange={(e) => onChange(e.target.name, e.target.value, index)}
            >
                <>
                    <option className="p-2" value=''> Select an Option </option>
                    {filterOptions && filterOptions.find(filter => filter.fieldName === fieldValue)?.operators?.map(item => <option key={item.key} value={item.key} >{item.displayText}</option>)}
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
                    onChange={({ value }) => setSelectedCountry(value)}
                />
                {isTouched && <div className="invalid-feedback">{validationError.value}</div>}
            </React.Fragment>
        </div>
        <div>
            <label className="pt-2 mb-1 small font-weight-bold" for="value">
                Value
            </label>

            <React.Fragment>
                <Select
                    defaultValue={[]}
                    isMulti={true}
                    name={fieldValue}
                    hideSelectedOptions={false}
                    options={getSpecialtyOptions()}
                    className="multiselect"
                    classNamePrefix="multiselect"
                    value={getSelectedOptions()}
                    onChange={selectedOption => {
                        const value = (selectedOption || []).map(o => o.value);
                        onChange('value', value, index);
                    }}
                />
                {isTouched && <div className="invalid-feedback">{validationError.value}</div>}
            </React.Fragment>
        </div>
    </div>
}

export default SpecialtyFilter;
