import React, {useContext, useState} from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import {AuthContext, AuthProvider, IAuthContext, TAuthConfig, TRefreshTokenExpiredEvent} from "react-oauth2-code-pkce"

const authConfig: TAuthConfig = {
    clientId: 'public-client',
    authorizationEndpoint: 'https://app.please-open.it/auth/realms/ee1afd72-71a9-49ad-a975-54ed46cc56a3/protocol/openid-connect/auth',
    tokenEndpoint: 'https://app.please-open.it/auth/realms/ee1afd72-71a9-49ad-a975-54ed46cc56a3/protocol/openid-connect/token',
    logoutEndpoint: 'https://app.please-open.it/auth/realms/ee1afd72-71a9-49ad-a975-54ed46cc56a3/protocol/openid-connect/logout',
    redirectUri: 'http://localhost:3000',
    scope: 'openid',
    onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) => window.confirm('Session expired. Refresh page to continue using the site?') && event.login(),
}

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

const UserInfo = (): JSX.Element => {
    const {token, tokenData, logOut} = useContext<IAuthContext>(AuthContext)
    const [publicResponse, setPublicResponse] = useState("Not called yet");
    const [adminResponse, setAdminResponse] = useState("Not called yet");
    const [userResponse, setUserResponse] = useState("Not called yet");

    const callPublic = async () => {
        const message = await callEndpoint('http://localhost:8081/api/v1/public', token);
        setPublicResponse(message);
    }

    const callAdmin = async () => {
        const message = await callEndpoint('http://localhost:8081/api/v1/admin', token);
        setAdminResponse(message);
    }

    const callUser = async () => {
        const message = await callEndpoint('http://localhost:8081/api/v1/user', token);
        setUserResponse(message);
    }

    return <>
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

    </>
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <AuthProvider authConfig={authConfig}>
        <UserInfo/>
    </AuthProvider>
);
