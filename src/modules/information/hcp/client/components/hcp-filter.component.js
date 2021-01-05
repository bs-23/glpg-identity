import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { getFilterOptions, getDatasyncFilterOptions } from './hcp-filter-options';
import { MultiFilter } from "../../../../core/client/components/MultiFilter";
import { useSelector, useDispatch } from 'react-redux';
import { getHcpFilterSettings } from '../hcp.actions';

const HCPFilter = ({ selectedFilterSetting, onHide, onExecute, show, tableName }, ref) => {
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const userFilters = tableName === 'hcp-profiles'
        ? useSelector(state => state.hcpReducer.filterPresetsCdp)
        : useSelector(state => state.hcpReducer.filterPresetsCrdlp);
    const dispatch = useDispatch();

    const multiFilterRef = useRef();

    const scopeOptions = tableName === 'crdlp-hcp-profiles' ? [
        { key: 'scope-hcp', text: 'Health Care Professional', icon: 'fas fa-user-md' },
        { key: 'scope-pe', text: 'Professional Engagements', icon: 'far fa-address-card' },
        { key: 'scope-hco', text: 'Health Care Organization', icon: 'far fa-hospital' },
        { key: 'scope-wa', text: 'Workplace Address', icon: 'fas fa-search-location' }
    ] : null;

    const userCountryFilterOption = loggedInUser.countries.reduce((acc, c) => {
        const country = allCountries.find(ac => c.toLowerCase() === ac.country_iso2.toLowerCase());
        country &&  acc.push({ value: country.codbase, displayText: country.codbase_desc });
        return acc;
    }, []);
    const filterOptions = tableName === 'crdlp-hcp-profiles'
        ? getDatasyncFilterOptions(userCountryFilterOption)
        : getFilterOptions(userCountryFilterOption);

    useEffect(() => {
        if(show) dispatch(getHcpFilterSettings(tableName));
    }, [show]);

    useImperativeHandle(ref, () => ({
        multiFilterProps: multiFilterRef.current
    }));

    return <MultiFilter
        show={show}
        filterPresets={userFilters}
        selectedSetting={(selectedFilterSetting || {}).settings}
        selectedSettingTitle={(selectedFilterSetting || {}).title}
        selectedSettingID={(selectedFilterSetting || {}).id}
        options={filterOptions}
        onHide={onHide}
        onExecute={onExecute}
        ref={multiFilterRef}
        scopeOptions={scopeOptions}
    />
}

export default React.forwardRef(HCPFilter);
