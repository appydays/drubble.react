import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from "react-i18next";
// import './LeaderBoardButton.css';

function SettingsButton({setIsSettingsModalOpen}) {
    const { t } = useTranslation();
    return (
        <button className="settings"
                title={t('footer.tabs.settings')}
                onClick={() => setIsSettingsModalOpen(true)}>
            <FontAwesomeIcon icon={faCog} />
        </button>
    );
}

export default SettingsButton;