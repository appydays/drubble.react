// src/components/LanguageSwitcher.js
import React, { useEffect, useState } from 'react'; // Import useEffect
import { useTranslation } from 'react-i18next';
import ReactFlagsSelect from 'react-flags-select';
import cyFlagSvg from '../assets/flags/cy.svg';

import './css/LanguageSwitcher.css';

function LanguageSwitcher() {
    const { t, i18n } = useTranslation();

    // Determine the initially selected language/flag code
    // Ensure this resolves to 'CY' or 'GB' as expected by ReactFlagsSelect
    // i18n.language will eventually be the detected language ('cy', 'en', etc.)
    // If i18n is not yet initialized or language is not set, use fallbackLng.
    const initialLocale = i18n.language || i18n.fallbackLng?.[0] || 'en'; // Use optional chaining for safety
    const initialFlagCode = initialLocale === 'cy' ? 'CY' : initialLocale.toUpperCase();

    // State to manage the selected flag, which can be updated after i18n fully loads
    const [selectedFlag, setSelectedFlag] = useState(initialFlagCode);

    // Use useEffect to update the selected flag once i18n.language is definitively set
    useEffect(() => {
        if (i18n.isInitialized && i18n.language) {
            const resolvedLocale = i18n.language;
            const resolvedFlagCode = resolvedLocale === 'cy' ? 'CY' : resolvedLocale.toUpperCase();
            setSelectedFlag(resolvedFlagCode);
        }
    }, [i18n.isInitialized, i18n.language]); // Re-run when i18n initializes or language changes

    // If i18n is not yet initialized, show a loading message
    if (!i18n.isInitialized) {
        return <div>{t('language-selector.loading')}</div>;
    }

    const selectorStyle = {
        '--cy-flag-svg-url': `url(${cyFlagSvg})`,
    };

    return (
        <div style={selectorStyle} className={`language-flag-selector-wrapper ${selectedFlag === 'CY' ? 'selected-welsh-active' : ''}`}>
            <ReactFlagsSelect
                // Use the state variable for the selected prop
                selected={selectedFlag}
                onSelect={(code) => {
                    const localeCode = code === 'CY' ? 'cy' : code.toLowerCase();
                    i18n.changeLanguage(localeCode);
                    setSelectedFlag(code); // Update local state immediately on select
                }}
                countries={["CY", "GB"]} // Explicitly list supported flag codes
                customLabels={{
                    "GB": { primary: "English", secondary: "Saesneg" },
                    "CY": { primary: "Cymraeg", secondary: "Welsh" }
                }}
                selectedSize={18}
                optionsSize={14}
                placeholder={t('language-selector.placeholder')}
                className="ReactFlagsSelect-module_flagsSelect__2pfa2 language-flag-selector"
                data-testid="rfs"
            />
        </div>
    );
}

export default LanguageSwitcher;