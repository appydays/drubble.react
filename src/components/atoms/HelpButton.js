import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

function HelpButton({setIsSplashHelpModalOpen}) {
    const { t } = useTranslation();
    return (
        <button className="help"
                title={t('footer.tabs.help')}
                onClick={() => setIsSplashHelpModalOpen(true)}>
            <FontAwesomeIcon icon={faQuestionCircle} />
        </button>
    );
}

export default HelpButton;