import React from 'react';
import { getFilterOptions } from './hcp-filter-options';
import { MultiFilter } from "../../../../core/client/components/MultiFilter";
import { useSelector } from 'react-redux';

console.log(getFilterOptions())

const HCPFilter = ({ onHide, onExecute }) => {
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    const userCountryFilterOption = loggedInUser.countries.reduce((acc, c) => {
        const country = allCountries.find(ac => c.toLowerCase() === ac.country_iso2.toLowerCase());
        country &&  acc.push({ value: c, displayText: country.countryname });
        return acc;
    }, []);
    const filterOptions = getFilterOptions(userCountryFilterOption);

    return <MultiFilter
        options={filterOptions}
        onHide={onHide}
        onExecute={onExecute}
    />
}

export default HCPFilter;
