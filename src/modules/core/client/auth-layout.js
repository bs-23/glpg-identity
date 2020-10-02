import React from 'react'
import { useIdleTimer } from 'react-idle-timer'
import App from './app.component'
 
export default function (props) {
  const handleOnIdle = event => {
    console.log('user is idle', event)
    console.log('last active', getLastActiveTime())
  }
 
  const handleOnActive = event => {
    console.log('user is active', event)
    console.log('time remaining', getRemainingTime())
  }
 
  const handleOnAction = event => {
    console.log('user did something', event)
  }
 
  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    onAction: handleOnAction,
    debounce: 500
  })
 
  return <App/>
}