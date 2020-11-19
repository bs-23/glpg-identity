import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from 'react-cookie';

import store from "./store";
import App from './app.component';
import IdleTimeOutModal from './components/idle-timeout.component';

ReactDOM.render(
    <CookiesProvider>
        <Provider store={store}>
            <BrowserRouter>
                <App/>
                <IdleTimeOutModal show={false}/>
            </BrowserRouter>
        </Provider>
    </CookiesProvider>,
    document.getElementById("app")
);
