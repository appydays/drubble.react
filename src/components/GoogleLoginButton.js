import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const baseUrl = process.env.REACT_APP_API_URL;
const apiUrl = baseUrl + '/api';

const GoogleLoginButton = ({ onLogin }) => {
    const { t,i18n } = useTranslation();

    useEffect(() => {
        window.google.accounts.id.initialize({
            client_id: `${process.env.REACT_APP_GOOGLE_CLIENT_ID}`,
            callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { theme: "outline", size: "large" }
        );
    }, []);

    const handleCredentialResponse = async (response) => {

        await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include', // <<<--- CRITICAL: Allows sending/receiving cookies
            headers: {
                'Accept': 'application/json', // Indicate that you expect JSON response
                'Accept-Language': i18n.language
            },
        });

        // Send the token to your Laravel backend
        const res = await fetch(`${apiUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json", 'Accept-Language': i18n.language },
            body: JSON.stringify({ token: response.credential }),
        });

        const data = await res.json();
        if (res.ok && data.user) {
            // Handle login success

            // You can even add a small, temporary delay for manual observation
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 3 seconds

            onLogin(data);

        } else {
            console.error("Google login failed", data);
        }
    };

    return  <div>
                {/*<div>{t('auth.social-login.google-label')}</div>*/}
                <div id="google-signin-button"></div>
            </div>;
};

export default GoogleLoginButton;
