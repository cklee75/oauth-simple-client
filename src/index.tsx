import React, {useContext, useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import {AuthContext, AuthProvider, IAuthContext, TAuthConfig, TRefreshTokenExpiredEvent} from "react-oauth2-code-pkce"
import LogoutHandler from "./LogoutHandler";
import { Helmet } from "react-helmet";

const authConfig: TAuthConfig = {
    clientId: process.env.REACT_APP_CLIENT_ID || 'default-client-id',
    authorizationEndpoint: process.env.REACT_APP_AUTHORIZATION_ENDPOINT || '',
    tokenEndpoint: process.env.REACT_APP_TOKEN_ENDPOINT || '',
    logoutEndpoint: process.env.REACT_APP_LOGOUT_ENDPOINT || '',
    redirectUri: process.env.REACT_APP_REDIRECT_URI || '',
    scope: 'openid',
    // TODO: Temporary comment to see if the refresh token is working
    // onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) => window.confirm('Session expired. Refresh page to continue using the site?') && event.login(),
}

console.log("Auth Config: " + authConfig);

const callEndpoint = async (url: string, token: string) => {
    const currentdate = new Date();
    const datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth()+1)  + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();

    var message;

    try {
        const response = await axios.get(url, {headers: {'Authorization': `Bearer ${token}`}});
        message = response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(`error calling endpoint ${url}: ${error}`)
            if (error.response) {
                message = `Error: ${error.response.status}`
            } else {
                message = error;
            }
        } else {
            throw error;
        }
    }
    return `called at ${datetime} - ${message}`;
}

const resourceServerDomain = process.env.REACT_APP_RESOURCE_SERVER || '';
const   UserInfo = (): JSX.Element => {
    const {token, tokenData, logOut, login} = useContext<IAuthContext>(AuthContext)
    const [publicResponse, setPublicResponse] = useState("Not called yet");
    const [adminResponse, setAdminResponse] = useState("Not called yet");
    const [userResponse, setUserResponse] = useState("Not called yet");

    const callPublic = async () => {
        const message = await callEndpoint(resourceServerDomain + '/api/v1/public', token);
        setPublicResponse(message);
    }

    const callAdmin = async () => {
        const message = await callEndpoint(resourceServerDomain + '/api/v1/admin', token);
        setAdminResponse(message);
    }

    const callUser = async () => {
        const message = await callEndpoint(resourceServerDomain + '/api/v1/user', token);
        setUserResponse(message);
    }

    return <>
        <Helmet>
        <meta http-equiv="Content-Security-Policy" content="frame-src 'self' https://app.please-open.it http://localhost:8082 https://prawn-humble-mackerel.ngrok-free.app; frame-ancestors 'self' https://app.please-open.it;" />
        </Helmet>
        <h4>Your complete Access Token</h4>
        <pre>{token}</pre>

        <h4>Your decoded JWT payload </h4>
        <pre>{JSON.stringify(tokenData, null, 2)}</pre>

        <br/>
        <button onClick={callPublic}>Call /api/v1/public</button>
        <p>{publicResponse}</p>

        <br/>
        <button onClick={callUser}>Call /api/v1/user</button>
        <p>{userResponse}</p>

        <br/>
        <button onClick={callAdmin}>Call /api/v1/admin</button>
        <p>{adminResponse}</p>

        <br/>
        <button onClick={() => logOut()}>Log out</button>
        <br/>
        <br/>
        <button onClick={() => login()}>Refresh</button>

    </>
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <AuthProvider authConfig={authConfig}>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserInfo />} />
                <Route path="/logout" element={<LogoutHandler />} />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
);
