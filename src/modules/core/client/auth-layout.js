import React, { useEffect, useState } from "react";
import { useIdleTimer } from 'react-idle-timer';
import { IdleTimeOutModal } from './components/Idle-time-out-modal.component';
import App from './app.component';
 
export default function (props) {
    const [info, setInfo] = useState({
        timeout: 1000 * 5 * 1,
        showModal: false,
        userLoggedIn: false,
        isTimedOut: false
    });

    const handleOnIdle = event => {
        console.log('user is idle', event)
        console.log('last active', getLastActiveTime())

        if(info.isTimedOut){
            // this.props.history.push('/')
        }
        else{
            const obj = {...info, showModal: true, isTimedOut: true };
            setInfo(obj);
        }
    }
 
    const handleOnActive = event => {
        console.log('user is active', event);
        console.log('time remaining', getRemainingTime());
        const obj = {...info, isTimedOut: false };
        setInfo(obj);
    }
 
    const handleOnAction = event => {
        console.log('user did something', event)
        const obj = {...info, isTimedOut: false };
        setInfo(obj);
    }

    function handleClose() {
        const obj = {...info, showModal: false };
        setInfo(obj);
    }
  
    function handleLogout() {
        const obj = {...info, showModal: false };
        setInfo(obj);
        // this.props.history.push('/');
    }

 
    const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: 1000 * 5,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        debounce: 500
    })
 
    return (
        <>
            <App/>

            <IdleTimeOutModal 
                showModal={info.showModal} 
                handleClose={handleClose}
                handleLogout={handleLogout}
            />
        </>
    )
}