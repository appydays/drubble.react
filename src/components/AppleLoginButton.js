// src/components/AppleLoginButton.js
import React, { useEffect } from 'react';

const AppleLoginButton = ({ onLogin }) => {
    useEffect(() => {
        const initializeAppleSignIn = () => {
            // Check if window.AppleID and specifically window.AppleID.auth are defined
            if (window.AppleID && window.AppleID.auth) {
                console.log("AppleID.auth is ready. Initializing...");
                window.AppleID.auth.init({
                    clientId : process.env.REACT_APP_APPLE_SERVICE_ID, // Your Apple Services ID
                    scope : 'name email', // Request name and email
                    redirectURI : process.env.REACT_APP_URL + '/apple-callback.html', // Must match Apple Developer config
                    state : 'random_string_for_csrf_protection', // A random string for CSRF protection
                    usePopup : true // Set to true for a popup window, false for full redirect
                });

                // Add the Apple Sign In button listener
                // Ensure the DOM element for the button exists before attaching the listener
                const appleSignInButton = document.getElementById('appleid-signin');
                if (appleSignInButton) {
                    appleSignInButton.addEventListener('click', handleAppleLogin);
                } else {
                    console.warn("Apple Sign In button element (id='appleid-signin') not found in the DOM.");
                }
            } else {
                // If not ready, try again after a short delay
                console.log("AppleID.auth not ready yet, retrying initialization in 100ms...");
                setTimeout(initializeAppleSignIn, 100);
            }
        };

        // Start the initialization process
        initializeAppleSignIn();

        // Cleanup function for useEffect: remove the event listener when the component unmounts
        return () => {
            const appleSignInButton = document.getElementById('appleid-signin');
            if (appleSignInButton) {
                appleSignInButton.removeEventListener('click', handleAppleLogin);
            }
        };

    }, []); // Empty dependency array means this runs once on mount

    const handleAppleLogin = async () => {
        try {
            // Re-check if AppleID.auth is available before calling signIn, as component might have re-rendered
            if (!window.AppleID || !window.AppleID.auth) {
                console.error("AppleID.auth not available when trying to sign in. SDK might not be initialized.");
                onLogin({ success: false, message: 'Apple Sign In SDK not fully initialized.' });
                return;
            }
            const response = await window.AppleID.auth.signIn();
            console.log('Apple ID auth response:', response);

            // Send the authorization code, ID token, and any user details received to your Laravel backend
            sendAppleAuthToBackend(response.authorization.code, response.authorization.id_token, response.user);

        } catch (error) {
            console.error('Apple Sign In failed:', error);
            // Handle login failure, e.g., user cancelled or an error occurred
            onLogin({ success: false, message: 'Apple Sign In cancelled or failed.' });
        }
    };

    const sendAppleAuthToBackend = async (code, idToken, userDetails) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/apple`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: code,
                    idToken: idToken,
                    // Pass name and email, which are only provided on the first sign-in
                    name: userDetails?.name,
                    email: userDetails?.email,
                }),
            });

            const data = await res.json();
            if (res.ok && data.user && data.token) {
                // Success: pass user data and token to the parent's onLogin handler
                onLogin(data);
            } else {
                // Handle server-side login failure
                const errorMessage = data.message || "Apple login failed on server.";
                console.error("Apple login failed on server:", errorMessage, data);
                onLogin({ success: false, message: errorMessage });
            }
        } catch (error) {
            // Handle network errors
            console.error("Error sending Apple auth to backend:", error);
            onLogin({ success: false, message: "Network error during Apple login." });
        }
    };

    return (
        // The div with id="appleid-signin" is where Apple's SDK will render the button.
        // It's crucial for this ID to exist in your component's JSX.
        <div
            id="appleid-signin"
            className="apple-signin-button" // Add a class for potential custom styling
            data-color="black" // or "white" for button color
            data-border-radius="true" // For rounded corners
            data-type="sign-in" // Type of button
            style={{
                width: '200px', // Example width, adjust as needed
                height: '40px', // Example height, adjust as needed
                display: 'inline-block',
                cursor: 'pointer'
            }}
        >
            {/* Apple's SDK will automatically populate this div with the button SVG/HTML */}
        </div>
    );
};

export default AppleLoginButton;