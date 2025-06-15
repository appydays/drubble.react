import React from 'react';

const CookieSettingsButton = () => {
    // No need for isReady state or useEffect for checking a non-existent function.
    // CookieYes will handle the event listener for the cky-banner-element class.

    return (
        <div className="cookie-settings-btn-container">
            {/* Add the cky-banner-element class to your button */}
            <button className="cky-banner-element">
                Manage Cookie Preferences
            </button>
        </div>
    );
};

export default CookieSettingsButton;