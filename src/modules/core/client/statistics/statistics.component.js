import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select, { components } from 'react-select';
import { getStatistics, clearStatistics } from './statistics.actions';

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
        } else {
            dispatch(clearStatistics());
        }
    }, [selectedCountries]);

    return (
        <div className={`hot-statistics shadow-sm bg-white ${show ? "cdp-inbox__expand" : ""}`}>
            <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
                Hot Statistics
                {/*<i onClick={() => setShow(true)} class="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block cursor-pointer"></i>
                <i class="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle cursor-pointer" onClick={() => setShow(false)}></i>*/}
                <i className="fas fa-chart-line"></i>
            </h5>
            <div className="px-3 pt-3 shadow-sm hot-statistics__box-wrap">
                <div className="row">
                    <div className="col-12 mb-3">
                        <Select
                            defaultValue={[]}
                            isMulti={true}
                            name="countries"
                            components={{ Option: CustomOption }}
                            hideSelectedOptions={false}
                            options={getCountriesOptions()}
                            className="multiselect"
                            menuPlacement="top"
                            classNamePrefix="multiselect"
                            value={selectedCountries}
                            isClearable={false}
                            onChange={selectedOption => {
                                setSelectedCountries(selectedOption);
                            }}
                        />
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3 border-top border-right border-bottom bg-white">
                        <i className="fas fa-user-md hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">{statistics.hcps_count || 0}</div>
                        <div className="hot-statistics__title">Total HCP Users</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3 border-top border-right border-bottom bg-white">
                        <i class="icon icon-data-consent-management hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">{statistics.consents_count || 0}</div>
                        <div className="hot-statistics__title">Total Consents</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3 border-top border-bottom bg-white">
                        <i class="icon icon-accept hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">{statistics.captured_consents_count || 0}</div>
                        <div className="hot-statistics__title"> Total Captured Consents</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3 border-right bg-white">
                        <i class="icon icon-partner hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">{statistics.business_partner_count || 0}</div>
                        <div className="hot-statistics__title"> Total Busniess Partners</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3 border-right bg-white">
                        <i class="icon icon-marketing-promotion hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">0</div>
                        <div className="hot-statistics__title">Total Campaigns</div>
                    </div>
                </div>
            </div>

        </div>
    )
}
