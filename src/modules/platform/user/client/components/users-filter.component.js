import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { MultiFilter } from '../../../../core/client/components/MultiFilter/';
import { getFilterOptions } from './users-filter-options';
import { getUserFilterSettings } from '../user.actions';
import { profileActions } from '../../../../platform';

const tablePresetPathMap = {
    'cdp-users': 'cdpUsersFilters'
}

const UsersFilter = ({ selectedFilterSetting, onHide, onExecute, show, tableName, selectedScopeKey }, ref) => {
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const userFilters = useSelector(state => state.userReducer[tablePresetPathMap[tableName]]);
    const allProfiles = useSelector(state => state.profileReducer.profiles);

    const dispatch = useDispatch();

    const multiFilterRef = useRef();

    const userCountryFilterOption = loggedInUser.countries.reduce((acc, c) => {
        const country = allCountries.find(ac => c.toLowerCase() === ac.country_iso2.toLowerCase());
        country &&  acc.push({ value: country.codbase, displayText: country.codbase_desc });
        return acc;
    }, []);

    let profileOptions;

    if(allProfiles) {
        profileOptions = allProfiles
            .filter(p => p.slug !== 'system_admin')
            .map(p => ({ value: p.id, displayText: p.title }));
    }

    const filterOptions = getFilterOptions(userCountryFilterOption, profileOptions);

    useEffect(() => {
        if(show) {
            dispatch(getUserFilterSettings(tableName));
            dispatch(profileActions.getProfiles());
        }
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
        selectedScopeKey={selectedScopeKey}
        maxNumberOfFilters={5}
    />
}

export default React.forwardRef(UsersFilter);
