import React from 'react';
import { useTranslation } from 'react-i18next';
import './css/DeleteRequest.css'; // Make sure this CSS file exists in the same directory!

function DeleteRequestHelp() {
    const { t } = useTranslation();

    const sitename = process.env.REACT_APP_SITE_NAME;
    const supportEmail = process.env.REACT_APP_SUPPORT_EMAIL;

    return (
        <div className="delete-request-help-container"> {/* Replaced <body> with a div for component */}

            <h1>{t('account.privacy.delete.help.title', { siteName: sitename })}</h1>

            <div className='delete-request-help-content'>
                {t('account.privacy.delete.help.content', {
                    siteName: sitename,
                    supportEmail: supportEmail,
                })}
            </div>
            <div>

            </div>

        </div>
    );
}

export default DeleteRequestHelp;