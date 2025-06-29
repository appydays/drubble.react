import React from 'react';
import { useTranslation } from 'react-i18next';

function FeedbackButton({ onClick }) {

    const { t } = useTranslation();

    return (
        <button className="key special feedback"
                title="Feedback"
                onClick={onClick}>
            {t('settings.feedback.title')}
        </button>
    );
}

export default FeedbackButton;
