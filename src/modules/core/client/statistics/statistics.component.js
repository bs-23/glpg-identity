import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select, { components } from 'react-select';
import { getStatistics, clearStatistics } from './statistics.actions';
import axios from 'axios';
import fileDownload from 'js-file-download';
import CountUp from 'react-countup';
import { getAllCountries } from '../country/country.actions';

export default function HotStatistic() {
    const dispatch = useDispatch();
    const [show, setShow] = React.useState();
    const statistics = useSelector(state => state.statisticsReducer.statistics);
    const prevousStatistics = useSelector(state => state.statisticsReducer.statistics);
    const permittedCountries = useSelector(state => state.userReducer.loggedInUser.countries) || [];
    const countries = useSelector(state => state.countryReducer.countries);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [countryOptions, setCountryOptions] = useState([]);

    let getCountryOptions = countries.filter(c => permittedCountries.map(c => c.toLowerCase()).includes(c.country_iso2.toLowerCase())).map(c => ({ value: c.country_iso2.toLowerCase(), label: c.countryname, checked: true }));

    const getSelectedCountries = (country) => {
        countryOptions.map(countryOption => {
            if (countryOption.value === country.value) {
                countryOption.checked = !countryOption.checked;
            }
        });
        setCountryOptions(countryOptions);
        let activeCountries = countryOptions.filter(activeCountry => activeCountry.checked);
        if (activeCountries.length > 0) setSelectAll(true);
        setSelectedCountries(activeCountries);
    }

    const getAllCountries = (countryOptions, checked) => {
        countryOptions.map(countryOption => { countryOption.checked = checked });
        setCountryOptions(countryOptions);
        let activeCountries = countryOptions.filter(activeCountry => activeCountry.checked);
        setSelectedCountries(activeCountries);
        setSelectAll(checked ? false : true);
    }

    useEffect(() => {
        setCountryOptions(getCountryOptions);
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

    const exportExcelFile = () => {
        const selectedCountryCodes = selectedCountries.map(sc => sc.value);
        const query = new URLSearchParams('');
        selectedCountryCodes.forEach(sc => query.append('country', sc));

        axios.get(`/api/export-hot-statistics?${query.toString()}`, {
            responseType: 'blob',
        }).then(res => {
            const pad2 = (n) => (n < 10 ? '0' + n : n);

            var date = new Date();
            const timestamp = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());

            fileDownload(res.data, `hot_statistics_${timestamp}.xlsx`);
        }).catch(error => {
            /**
             * the error response is a blob because of the responseType option.
             * text() converts it back to string
             */
            console.log(error);

            // addToast(error, {
            //     appearance: 'warning',
            //     autoDismiss: true
            // });
        });
    };

    return (
        <div className={`hot-statistics shadow-sm bg-white ${show ? "cdp-inbox__expand" : ""}`}>
            <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
                Hot Statistics
                <i onClick={() => setShow(true)} className="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block cursor-pointer"></i>
                <i className="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle cursor-pointer" onClick={() => setShow(false)}></i>
                <i className="fas fa-chart-line d-block d-lg-none"></i>
            </h5>
            <div className="px-3 pt-3 shadow-sm hot-statistics__box-wrap">
                <div className="row">
                    <div className="col-12 mb-3">
                        <div className="bg-white border rounded p-2">
                            {countryOptions.map((country, key) => {
                                return <span key={key} title={country.checked ? "Click to deselect" : "Click to select"} className={country.checked ? "badge hot-statistics__badge-selected text-white mr-2 mb-1 font-weight-normal cursor-pointer hot-statistics__badge" : "badge mr-2 mb-1 font-weight-normal cursor-pointer hot-statistics__badge text-dark"} onClick={() => { getSelectedCountries(country) }}>{country.label}
                                </span>
                            })}
                            <span className={selectAll ? "badge hot-statistics__badge-selected text-white mr-2 mb-1 font-weight-normal cursor-pointer hot-statistics__badge" : "badge mr-2 mb-1 font-weight-normal cursor-pointer hot-statistics__badge text-dark"} onClick={() => selectAll ? getAllCountries(countryOptions, true) : getAllCountries(countryOptions, false)}>{selectAll ? 'Select All' : 'Deselect All'}</span>
                        </div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i className="far fa-user hot-statistics__icon"></i>
                        <CountUp className="hot-statistics__amount" start={0} end={statistics.hcps_count || 0} duration={1.5} />
                        <div className="hot-statistics__title">Total HCP Users</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i class="icon icon-data-consent-management hot-statistics__icon"></i>
                        <CountUp className="hot-statistics__amount" start={0} end={statistics.consents_count || 0} duration={1.5} />
                        <div className="hot-statistics__title">Total Consents</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i class="icon icon-accept hot-statistics__icon"></i>
                        <CountUp className="hot-statistics__amount" start={0} end={statistics.captured_consents_count || 0} duration={1.5} />
                        <div className="hot-statistics__title"> Total Captured Consents</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i class="icon icon-partner hot-statistics__icon"></i>
                        <CountUp className="hot-statistics__amount" start={0} end={statistics.business_partner_count || 0} duration={1.5} />
                        <div className="hot-statistics__title"> Total Business Partners</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i class="icon icon-marketing-promotion hot-statistics__icon"></i>
                        <CountUp className="hot-statistics__amount" start={0} end={0} duration={1.5} />
                        <div className="hot-statistics__title">Total Campaigns</div>
                    </div>
                </div>
            </div>
            <div className="bg-white">
                {/*Note - due to compliance issue the export functionality off in Tablet and Phone*/}
                <div className="p-3 pb-0 mb-0 w-100 d-none d-lg-flex align-items-center bg-white cdp-btn-link-secondary cursor-pointer" onClick={() => exportExcelFile()}><i className="fas fa-download pr-2"></i> Export Statistics</div>
            </div>
        </div>
    )
}
