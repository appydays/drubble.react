import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

function LeaguesButton({setIsLeaguesModalOpen}) {
    const { t } = useTranslation();
    return (
        <button className="leagues-button"
                title={t('footer.tabs.leagues')}
                onClick={() => setIsLeaguesModalOpen(true)}>
            <FontAwesomeIcon icon={faTable} size="2x" color="#333"/>
        </button>
    );
}

export default LeaguesButton;