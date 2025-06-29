import React from 'react';
import { useTranslation } from 'react-i18next';
import './css/TermsOfService.css'; // Make sure this CSS file exists in the same directory!
                               // (It can be identical to PrivacyPolicy.css if styles are the same)

function TermsOfService() {
    const { t } = useTranslation();

    // Access environment variables
    const siteName = process.env.REACT_APP_SITE_NAME;
    const supportEmail = process.env.REACT_APP_SUPPORT_EMAIL;

    return (
        <div className="terms-of-service-container"> {/* Replaced <body> with a div */}

            <h1>{t('terms.title', { siteName: siteName })}</h1>
            <p><strong>{t('terms.last_updated_label')}:</strong> {t('terms.last_updated_date')}</p>

            <p>{t('terms.intro_para_1', { companyName: "DPDigital", siteName: siteName })}</p>
            <p>{t('terms.intro_para_2')}</p>
            <p>{t('terms.intro_para_3')}</p>

            <h2>{t('terms.section_1_title')}</h2>
            <p>{t('terms.section_1_para_1', { companyName: "DPDigital", siteName: siteName })}</p>

            <h2>{t('terms.section_2_title')}</h2>
            <p>{t('terms.section_2_para_1')}</p>
            <p>{t('terms.section_2_para_2', { siteName: siteName })}</p>
            <p>{t('terms.section_2_para_3')}</p>

            <h2>{t('terms.section_3_title')}</h2>
            <p>{t('terms.section_3_para_1')}</p>
            <p>{t('terms.section_3_para_2')}</p>
            <ul>
                <li>{t('terms.section_3_list_item_1')}</li>
                <li>{t('terms.section_3_list_item_2')}</li>
                <li>{t('terms.section_3_list_item_3')}</li>
                <li>{t('terms.section_3_list_item_4')}</li>
            </ul>

            <h2>{t('terms.section_4_title')}</h2>
            <p>{t('terms.section_4_para_1', { companyName: "DPDigital" })}</p>

            <h2>{t('terms.section_5_title')}</h2>
            <p>{t('terms.section_5_para_1')}</p>
            <p>
                {t('terms.section_5_para_2_part1')}
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                {t('terms.section_5_para_2_part2')}
            </p>

            <h2>{t('terms.section_6_title')}</h2>
            <p>{t('terms.section_6_para_1')}</p>
            <p>{t('terms.section_6_para_2', { companyName: "DPDigital" })}</p>

            <h2>{t('terms.section_7_title')}</h2>
            <p>{t('terms.section_7_para_1', { companyName: "DPDigital" })}</p>

            <h2>{t('terms.section_8_title')}</h2>
            <p>
                {t('terms.section_8_para_1_part1')}
                <strong>{t('terms.section_8_governing_law_country')}</strong>
                {t('terms.section_8_para_1_part2')}
            </p>
            <p>{t('terms.section_8_para_2')}</p>

            <h2>{t('terms.section_9_title')}</h2>
            <p>{t('terms.section_9_para_1')}</p>
            <p>{t('terms.section_9_para_2')}</p>

            <h2>{t('terms.section_10_title')}</h2>
            <p>{t('terms.section_10_para_1')}</p>
            <p>
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>

        </div>
    );
}

export default TermsOfService;