import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select, { components } from 'react-select';
import { getStatistics, clearStatistics } from './statistics.actions';
import axios from 'axios';
import fileDownload from 'js-file-download';

export default function HotStatistic() {
    const dispatch = useDispatch();
    const [show, setShow] = React.useState();
    const statistics = useSelector(state => state.statisticsReducer.statistics);
    const permittedCountries = useSelector(state => state.userReducer.loggedInUser.countries) || [];
    const countries = useSelector(state => state.countryReducer.countries);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [countryOptions, setCountryOptions] = useState([]);

    let getCountryOptions = countries.filter(c => permittedCountries.map(c => c.toLowerCase()).includes(c.country_iso2.toLowerCase())).map(c => ({ value: c.country_iso2.toLowerCase(), label: c.countryname, checked: false}));

    const getSelectedCountries = (country,index) => {
        countryOptions.map(countryOption => {
          if(countryOption.value === country.value){
              countryOption.checked = !countryOption.checked;
          }
        });
        setCountryOptions(countryOptions);
        let activeCountries = countryOptions.filter(activeCountry =>  activeCountry.checked);
        setSelectedCountries(activeCountries);
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
                        {countryOptions.map((country, key) => {
                            return <span className={country.checked ?"badge badge-success mr-1" : "badge badge-secondary mr-1"} onClick={(e)=> {getSelectedCountries(country, key)}}>{country.label}
                            </span>
                        })}
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i className="far fa-user hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">{statistics.hcps_count || 0}</div>
                        <div className="hot-statistics__title">Total HCP Users</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i class="icon icon-data-consent-management hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">{statistics.consents_count || 0}</div>
                        <div className="hot-statistics__title">Total Consents</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i class="icon icon-accept hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">{statistics.captured_consents_count || 0}</div>
                        <div className="hot-statistics__title"> Total Captured Consents</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i class="icon icon-partner hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">{statistics.business_partner_count || 0}</div>
                        <div className="hot-statistics__title"> Total Business Partners</div>
                    </div>
                    <div className="col-6 col-sm-4 hot-statistics__box py-3">
                        <i class="icon icon-marketing-promotion hot-statistics__icon"></i>
                        <div className="hot-statistics__amount">0</div>
                        <div className="hot-statistics__title">Total Campaigns</div>
                    </div>
                </div>
            </div>
            <div className="bg-white">
                <div className="p-3 pb-0 mb-0 w-100 d-flex align-items-center bg-white cdp-btn-link-secondary cursor-pointer" onClick={() => exportExcelFile()}><i className="fas fa-download pr-2"></i> Export Statistics</div>
            </div>
        </div>
    )
}
