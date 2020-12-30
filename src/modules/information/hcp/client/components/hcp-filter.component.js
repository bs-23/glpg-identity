import React, { useEffect } from 'react';
import { getFilterOptions } from './hcp-filter-options';
import { MultiFilter } from "../../../../core/client/components/MultiFilter";
import { useSelector, useDispatch } from 'react-redux';
import { getHcpFilterSettings } from '../hcp.actions';

const HCPFilter = ({ selectedFilterSetting, onHide, onExecute }) => {
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const userFilters = useSelector(state => state.hcpReducer.filterPresets);
    const dispatch = useDispatch();


    const userCountryFilterOption = loggedInUser.countries.reduce((acc, c) => {
        const country = allCountries.find(ac => c.toLowerCase() === ac.country_iso2.toLowerCase());
        country &&  acc.push({ value: country.codbase, displayText: country.codbase_desc });
        return acc;
    }, []);
    const filterOptions = getFilterOptions(userCountryFilterOption);

    useEffect(() => {
        dispatch(getHcpFilterSettings());
    }, []);

    return <MultiFilter
        filterPresets={userFilters}
        selectedSetting={(selectedFilterSetting || {}).settings}
        selectedSettingTitle={(selectedFilterSetting || {}).title}
        selectedSettingID={(selectedFilterSetting || {}).id}
        options={filterOptions}
        onHide={onHide}
        onExecute={onExecute}
    />
}

export default HCPFilter;
