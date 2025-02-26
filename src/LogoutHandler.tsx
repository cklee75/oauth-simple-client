import { useEffect, useContext } from "react";
import { AuthContext } from "react-oauth2-code-pkce";

const LogoutHandler = () => {
    const { logOut } = useContext(AuthContext); // Correct way to access logOut

    useEffect(() => {
        console.log("Front-channel logout detected. Logging out...");
        logOut(); // Trigger logout
    }, []);

    return <p>Logging out...</p>;
};

export default LogoutHandler;
