import { countBy } from 'lodash-es';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStatistics } from '../../client/statistics/statistics.actions';
export default function HotStatistic() {
    const dispatch = useDispatch();
    const [show, setShow] = React.useState();
    let hcps = useSelector(state => state.hcpReducer.hcps);
    console.log("hcps: ", )

    useEffect(() => {
        dispatch(getStatistics());
    }, []);
    return (
        <div className={`faq shadow-sm bg-white ${show ? "cdp-inbox__expand" : ""}`}>
            <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
                Hot Statistic
                <i onClick={() => setShow(true)} class="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block cursor-pointer"></i>
                <i class="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle cursor-pointer" onClick={() => setShow(false)}></i>
                <i className="far fa-bell cdp-inbox__icon-bell d-block d-lg-none"></i>
            </h5>
            <div className="container">
                <div className="row">
                    <div className="col-4 hot-statistics__box">
                        <div className="hot-statistics__title">Total HCP User</div>
                        <div className="hot-statistics__amount">{hcps.total}</div>
                        </div>
                    <div className="col-4 hot-statistics__box">
                        <div className="hot-statistics__title">Total Personal Tag</div>
                        <div className="hot-statistics__amount">0</div>
                        </div>
                    <div className="col-4 hot-statistics__box">
                        <div className="hot-statistics__title">Total Campaigns</div>
                        <div className="hot-statistics__amount">0</div>
                        </div>
                    <div className="col-4 hot-statistics__box">
                        <div className="hot-statistics__title"> Total Sample Request</div>
                        <div className="hot-statistics__amount">0</div>
                       </div>
                    <div className="col-4 hot-statistics__box">
                        <div className="hot-statistics__title"> Total Consents</div>
                        <div className="hot-statistics__amount">0</div>
                        </div>
                    <div className="col-4 hot-statistics__box"></div>
                </div>
            </div>
        </div>
    )
}
