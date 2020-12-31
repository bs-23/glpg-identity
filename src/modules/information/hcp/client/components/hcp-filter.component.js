import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { getFilterOptions } from './hcp-filter-options';
import { MultiFilter } from "../../../../core/client/components/MultiFilter";
import { useSelector, useDispatch } from 'react-redux';
import { getHcpFilterSettings } from '../hcp.actions';

const HCPFilter = ({ selectedFilterSetting, onHide, onExecute, show }, ref) => {
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const userFilters = useSelector(state => state.hcpReducer.filterPresets);
    const dispatch = useDispatch();

    const multiFilterRef = useRef();

    const userCountryFilterOption = loggedInUser.countries.reduce((acc, c) => {
        const country = allCountries.find(ac => c.toLowerCase() === ac.country_iso2.toLowerCase());
        country &&  acc.push({ value: country.codbase, displayText: country.codbase_desc });
        return acc;
    }, []);
    const filterOptions = getFilterOptions(userCountryFilterOption);

    useEffect(() => {
        dispatch(getHcpFilterSettings());
    }, []);

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
    />
}

export default React.forwardRef(HCPFilter);
