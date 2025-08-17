import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
// import './LeaderBoardButton.css';
import { useTranslation } from 'react-i18next';

function LeaderboardButton({setIsLeaderboardModalOpen}) {

    const { t } = useTranslation();
    return (
        <button className="leaderboard"
                title={ t('footer.tabs.leaderboard')}
                onClick={() => setIsLeaderboardModalOpen(true)}>
            <FontAwesomeIcon icon={faGlobe} />
        </button>
    );
}

export default LeaderboardButton;