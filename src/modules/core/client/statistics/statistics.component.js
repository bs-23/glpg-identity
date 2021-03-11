import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStatistics } from './statistics.actions';

export default function HotStatistic() {
    const dispatch = useDispatch();
    const [show, setShow] = React.useState();
    const statistics = useSelector(state => state.statisticsReducer.statistics);

    useEffect(() => {
        dispatch(getStatistics());
    }, []);

    return (
        <div className={`hot-statistics shadow-sm bg-white mb-3 ${show ? "cdp-inbox__expand" : ""}`}>
            <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
                Hot Statistics
                <i onClick={() => setShow(true)} class="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block cursor-pointer"></i>
                <i class="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle cursor-pointer" onClick={() => setShow(false)}></i>
                <i className="fas fa-chart-line d-block d-lg-none"></i>
            </h5>
            <div className="p-3 shadow-sm hot-statistics__box-wrap">
                <div className="row">
                    <div className="col-6 col-md-4 hot-statistics__box pb-4">
                        <div className="hot-statistics__title pb-3">Total Users</div>
                        <div className="hot-statistics__amount">{statistics.users_count}</div>
                    </div>
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
                        <div className="hot-statistics__title pb-3"> Total Campaigns</div>
                        <div className="hot-statistics__amount">0</div>
                    </div>
                </div>
            </div>
            
        </div>
    )
}
