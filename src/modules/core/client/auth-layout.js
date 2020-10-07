import React, { useEffect, useState } from "react";
import { useIdleTimer } from 'react-idle-timer';
import { useCookies } from 'react-cookie';
import { IdleTimeOutModal } from './components/Idle-time-out-modal.component';
import App from './app.component';
 
export default function (props) {
    const [info, setInfo] = useState({
        showModal: false,
        userLoggedIn: false,
    });
    const [, setCookie, removeCookie] = useCookies();

    const handleOnIdle = event => {
        console.log('user is idle', event)
        console.log('last active', getLastActiveTime())

        const obj = {...info, showModal: true};
        setInfo(obj);
    }
 
    const handleOnActive = event => {
        // console.log('user is active', event);
        // console.log('time remaining', getRemainingTime());
    }
 
    const handleOnAction = event => {
        // console.log('user did something', event)
        // console.log('time remaining', getRemainingTime());
    }

    function handleClose() {
        const obj = {...info, showModal: false }
        setInfo(obj);
    }
  
    function handleLogout() {
        setCookie('logged_in', '', { path: '/' });
        removeCookie('logged_in');
        
        // axios.get('/api/logout');
        // history.push('/login');

        document.getElementById('logout').click();
    }

    const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: 1000 * 60 * 14,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        debounce: 500
    })

    const [remainingTime, setRemainingTime] = useState(59);

    

    useEffect(() => {
        setTimeout(() => {
            const t = remainingTime - 1;
            if(info.showModal) {
                if(remainingTime) setRemainingTime(t);
                if(remainingTime === 0){
                    handleLogout();
                }
            }
            else setRemainingTime(59);
        }, 1000);
    });
 
    return (
        <>
            <App/>

            <IdleTimeOutModal 
                showModal={window.location.pathname !== '/login' && info.showModal} 
                handleClose={handleClose}
                handleLogout={handleLogout}
                remainingTime={remainingTime}
            />

            <a href="/api/logout" id='logout' hidden></a>
        </>
    )
}