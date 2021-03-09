import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

export default function HotStatistic() {
    const dispatch = useDispatch();
    const [show, setShow] = React.useState();

    return (
        <div className={`faq shadow-sm bg-white ${show ? "faq-expand" : ""}`}>
            <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
                Hot Statistic
                <i onClick={() => setShow(true)} class="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block cursor-pointer"></i>
                <i class="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle cursor-pointer" onClick={() => setShow(false)}></i>
                <i className="far fa-bell cdp-inbox__icon-bell d-block d-lg-none"></i>
            </h5>
        </div>
    )
}
