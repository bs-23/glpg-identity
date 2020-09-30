import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from 'react-cookie';

import store from "./store";
import App from "./app.component";
import IdleTimer from './idle-timer.component';

ReactDOM.render(
    <CookiesProvider>
        <Provider store={store}> 
            <BrowserRouter>
                <IdleTimer/>
            </BrowserRouter>
        </Provider>
    </CookiesProvider>,
    document.getElementById("app")
);
