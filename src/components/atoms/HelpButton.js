import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

function HelpButton({setIsSplashHelpModalOpen}) {
    return (
        <button className="help"
                title="Help"
                onClick={() => setIsSplashHelpModalOpen(true)}>
            <FontAwesomeIcon icon={faQuestionCircle} />
        </button>
    );
}

export default HelpButton;