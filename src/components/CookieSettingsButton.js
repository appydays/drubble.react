import React from 'react';
import { useTranslation } from 'react-i18next';

const CookieSettingsButton = () => {
    // No need for isReady state or useEffect for checking a non-existent function.
    // CookieYes will handle the event listener for the cky-banner-element class.
    const { t } = useTranslation();

    return (
        <div className="cookie-settings-btn-container">
            {/* Add the cky-banner-element class to your button */}
            <button className="cky-banner-element">{t('account.cookie-settings-button')}</button>
        </div>
    );
};

export default CookieSettingsButton;