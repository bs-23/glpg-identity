import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select, { components } from 'react-select';
import { getStatistics } from './statistics.actions';

export default function HotStatistic() {
    const dispatch = useDispatch();
    const [show, setShow] = React.useState();
    const statistics = useSelector(state => state.statisticsReducer.statistics);
    const permittedCountries = useSelector(state => state.userReducer.loggedInUser.countries) || [];
    const countries = useSelector(state => state.countryReducer.countries);
    const [selectedCountries, setSelectedCountries] = useState([]);

    const CustomOption = ({ children, ...props1 }) => {
        return (
            <components.Option {...props1}>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" checked={props1.isSelected} onChange={() => null} />
                    <label className="custom-control-label" for="customCheck1">{children}</label>
                </div>
            </components.Option>
        );
    };

    const getCountriesOptions = () => {
        return countries
            .filter(c => permittedCountries.map(c => c.toLowerCase()).includes(c.country_iso2.toLowerCase()))
            .map(c => ({ value: c.country_iso2.toLowerCase(), label: c.countryname }));
    }

    useEffect(() => {
        if (countries && countries.length) {
            setSelectedCountries(
                countries
                    .filter(c => permittedCountries.map(c => c.toLowerCase()).includes(c.country_iso2.toLowerCase()))
                    .map(c => ({ value: c.country_iso2.toLowerCase(), label: c.countryname }))
            );
        }
    }, [countries]);

    useEffect(() => {
        if (selectedCountries && selectedCountries.length) {
            const selectedCountryCodes = selectedCountries.map(sc => sc.value);

            const query = new URLSearchParams('');
            selectedCountryCodes.forEach(sc => query.append('country', sc));

            dispatch(getStatistics(`?${query.toString()}`));
        }
    }, [selectedCountries]);

    return (
        <div className={`hot-statistics shadow-sm bg-white mb-3 ${show ? "cdp-inbox__expand" : ""}`}>
            <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
                Hot Statistics
                {/*<i onClick={() => setShow(true)} class="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block cursor-pointer"></i>
                <i class="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle cursor-pointer" onClick={() => setShow(false)}></i>*/}
                <i className="fas fa-chart-line"></i>
            </h5>
            <div className="p-3 shadow-sm hot-statistics__box-wrap">
                <div className="row">
                    {/*<div className="col-12 hot-statistics__box pb-4">
                        <div className="form-group">
                            <select className="form-control">
                                <option><img height="20" width="20" src="/assets/flag/flag-belgium.svg" /><span>Belgium</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-germany.svg" /><span>Germany</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-spain.svg" /><span>Spain</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-france.svg" /><span>France</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-ireland.svg" /><span>Ireland</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-italy.svg" /><span>Italy</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-luxembourg.svg" /><span>Luxembourg</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-monaco.svg" /><span>Monaco</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-netherlands.svg" /><span>Netherlands</span></option>
                                <option><img height="20" width="20" src="/assets/flag/flag-united-kingdom.svg" /><span>United Kingdom</span></option>
                            </select>
                        </div>
                    </div>*/}
                    <Select
                        defaultValue={[]}
                        isMulti={true}
                        name="countries"
                        components={{ Option: CustomOption }}
                        hideSelectedOptions={false}
                        options={getCountriesOptions()}
                        className="multiselect"
                        classNamePrefix="multiselect"
                        value={selectedCountries}
                        onChange={selectedOption => {
                            setSelectedCountries(selectedOption);
                        }}
                    />
                    <div className="col-6 col-md-4 hot-statistics__box pb-4">
                        <div className="hot-statistics__title pb-3">Total HCP Users</div>
                        <div className="hot-statistics__amount">{statistics.hcps_count}</div>
                    </div>
                    <div className="col-6 col-md-4 hot-statistics__box pb-4">
                        <div className="hot-statistics__title pb-3">Total Consents</div>
                        <div className="hot-statistics__amount">{statistics.consents_count}</div>
                    </div>
                    <div className="col-6 col-md-4 hot-statistics__box pb-4">
                        <div className="hot-statistics__title pb-3"> Total Captured Consents</div>
                        <div className="hot-statistics__amount">{statistics.captured_consents_count}</div>
                    </div>
                    <div className="col-6 col-md-4 hot-statistics__box pb-4">
                        <div className="hot-statistics__title pb-3"> Total Busniess Partners</div>
                        <div className="hot-statistics__amount">{statistics.business_partner_count}</div>
                    </div>
                    <div className="col-6 col-md-4 hot-statistics__box pb-4">
                        <div className="hot-statistics__title pb-3"> Total Campaigns</div>
                        <div className="hot-statistics__amount">0</div>
                    </div>
                </div>
            </div>

        </div>
    )
}
