import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

const baseUrl = process.env.REACT_APP_API_URL;
const apiUrl = baseUrl + '/api';

const FacebookLoginButton = ({ onLogin }) => {

    const {t, i18n} = useTranslation();
    const [fbSDKReady, setFbSDKReady] = useState(false);

    useEffect(() => {
        // This effect runs once after the component mounts
        const handleFbSDKLoaded = () => {
            setFbSDKReady(true);
            console.log('Facebook SDK is ready!');
        };

        // Check if FB is already available (e.g., if component mounts later)
        if (window.FB) {
            setFbSDKReady(true);
        } else {
            // Listen for the custom event dispatched when the SDK is ready
            window.addEventListener('fbSDKLoaded', handleFbSDKLoaded);
        }

        // Cleanup: Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('fbSDKLoaded', handleFbSDKLoaded);
        };
    }, []); // Empty dependency array means this effect runs only once

    const sendFacebookDataToLaravel = async (accessToken, userID) => {
        try {
            const response = await fetch(`${apiUrl}/auth/facebook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify({accessToken, userID}),
            });

            const data = await response.json();
            if (response.ok) {
                // Laravel successfully authenticated the user and returned a token
                console.log('Logged in to Laravel:', data.token);

                await new Promise(resolve => setTimeout(resolve, 500)); // Wait 1/2 ssecond
                // Redirect or update UI
                onLogin(data);
            } else {
                console.error('Laravel backend error:', data.message);
            }
        } catch (error) {
            console.error('Error sending Facebook data to Laravel:', error);
        }
    };

    const responseFacebook = (response) => {
        console.log(response);
        // Handle the response from Facebook here
        if (response.authResponse) {
            const {accessToken, userID} = response.authResponse;
            // Pass this information to your Laravel backend
            sendFacebookDataToLaravel(accessToken, userID);
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    };

    const handleLogin = () => {
        if (fbSDKReady) {
            window.FB.login(responseFacebook, {scope: process.env.REACT_APP_FACEBOOK_SCOPE});
        } else {
            console.warn('Facebook SDK not yet ready. Please try again or wait.');
        }
    };

    return (
        fbSDKReady && (
        <div>
            {/*<div>{t('auth.social-login.facebook.label')}</div>*/}
            <button
                onClick={handleLogin}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#1877F2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                >
                    <path
                        d="M12 2.043c-5.522 0-9.997 4.475-9.997 9.997 0 4.962 3.655 9.07 8.441 9.873v-7.009h-2.339v-2.864h2.339v-2.186c0-2.32 1.405-3.585 3.491-3.585 1.002 0 1.868.075 2.118.108v2.417h-1.424c-1.127 0-1.346.536-1.346 1.321v1.73h2.668l-.427 2.864h-2.241v7.009c4.786-.803 8.441-4.911 8.441-9.873.001-5.522-4.474-9.997-9.996-9.997z"/>
                </svg>
                {t('auth.social-login.facebook.button')}
            </button>
        </div>
        )
    );
}
export default FacebookLoginButton;

