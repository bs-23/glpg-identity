import React, { useEffect, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import CountryCodes from 'country-codes-list';
import { useSelector } from 'react-redux';

const CountryPhoneInput = (props) => {
    const [selectedCountryCode, setSelectedCountryCode] = useState(0);
    const countries = useSelector(state => state.countryReducer.countries);

    const CountryCodesObject = CountryCodes.customList('countryCode', '+{countryCallingCode}');

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`;
        return `/assets/flag/flag-placeholder.svg`;
    }

    return <div className="input-group phone-input">
        <span className="input-group-btn">
            <Dropdown>
                {
                    countries.map( (country, index) => {
                        return index === selectedCountryCode ? (
                        <Dropdown.Toggle key={index} variant="" className="p-1 pt-2 px-2 pr-0 d-flex align-items-center rounded-0">
                            <img height="20" width="20" src={generateCountryIconPath(country.codbase_desc)} title={country.codbase_desc} />
                            <span className="country-phone-code pl-1">{ CountryCodesObject[country.country_iso2] }</span>
                        </Dropdown.Toggle>) : null
                    })
                }
                <Dropdown.Menu>
                    {
                        countries.map( (country, index) => {
                            return index === selectedCountryCode ? null :
                            (<Dropdown.Item onClick={() => {
                                setSelectedCountryCode(index);
                                const countryCode = CountryCodesObject[countries[index].country_iso2];
                                formikProps.setFieldValue('country_code', countryCode);
                            }} key={index} className="px-2 d-flex align-items-center">
                                <img height="20" width="20" src={generateCountryIconPath(country.codbase_desc)} title={country.codbase_desc} />
                                <span className="country-name pl-2">{ country.codbase_desc }</span>
                                <span className="country-phone-code pl-1">{ CountryCodesObject[country.country_iso2] }</span>
                            </Dropdown.Item>)
                        })
                    }
                </Dropdown.Menu>
            </Dropdown>
        </span>
        <input className="form-control rounded" type="text" {...props} />
    </div>
}

export default CountryPhoneInput;
