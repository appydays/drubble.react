import React from 'react';
import { useTranslation } from 'react-i18next';
import './css/PrivacyPolicy.css'; // Make sure this CSS file exists in the same directory!

function PrivacyPolicy() {
    const { t } = useTranslation();

    const sitename = process.env.REACT_APP_SITE_NAME;
    const supportEmail = process.env.REACT_APP_SUPPORT_EMAIL;

    return (
        <div className="privacy-policy-container"> {/* Replaced <body> with a div for component */}

            <h1>{t('privacy_policy.title', { sitename: sitename })}</h1>
            <p><strong>{t('privacy_policy.last_updated_label')}:</strong> {t('privacy_policy.last_updated_date')}</p>

            <p>
                {t('privacy_policy.intro_para_1', {
                    companyName: "DPDigital", // Hardcoded as per original HTML, make env var if dynamic
                    sitename: sitename
                })}
            </p>

            <p>{t('privacy_policy.intro_para_2')}</p>

            <h2>{t('privacy_policy.section_1_title')}</h2>
            <p>{t('privacy_policy.section_1_para_1', { companyName: "DPDigital" })}</p>
            <p>
                <strong>{t('privacy_policy.section_1_contact_email_label')}:</strong>
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>

            <h2>{t('privacy_policy.section_2_title')}</h2>
            <p>{t('privacy_policy.section_2_para_1')}</p>
            <ul>
                <li><strong>{t('privacy_policy.account_info_heading')}:</strong> {t('privacy_policy.account_info_text')}
                    <ul>
                        <li><strong>{t('privacy_policy.email_address_label')}:</strong> {t('privacy_policy.email_address_text')}</li>
                        <li><strong>{t('privacy_policy.nickname_label')}:</strong> {t('privacy_policy.nickname_text')}</li>
                        <li><strong>{t('privacy_policy.full_name_label')}:</strong> {t('privacy_policy.full_name_text')}</li>
                        <li><strong>{t('privacy_policy.third_party_ids_label')}:</strong> {t('privacy_policy.third_party_ids_text')}</li>
                    </ul>
                </li>
                <li><strong>{t('privacy_policy.communication_preferences_heading')}:</strong>
                    <ul>
                        <li><strong>{t('privacy_policy.newsletter_label')}:</strong> {t('privacy_policy.newsletter_text')}</li>
                        <li><strong>{t('privacy_policy.prompts_label')}:</strong> {t('privacy_policy.prompts_text')}</li>
                    </ul>
                </li>
                <li><strong>{t('privacy_policy.log_data_heading')}:</strong> {t('privacy_policy.log_data_text')}
                    <ul>
                        <li>{t('privacy_policy.ip_address_text')}</li>
                        <li>{t('privacy_policy.browser_text')}</li>
                        <li>{t('privacy_policy.os_text')}</li>
                        <li>{t('privacy_policy.access_times_text')}</li>
                        <li>{t('privacy_policy.diagnostic_data_text')}</li>
                    </ul>
                </li>
                <li><strong>{t('privacy_policy.cookies_heading')}:</strong> {t('privacy_policy.cookies_text')}</li>
            </ul>

            <h2>{t('privacy_policy.section_3_title')}</h2>
            <p>{t('privacy_policy.section_3_para_1')}</p>
            <ul>
                <li><strong>{t('privacy_policy.provide_maintain_app_heading')}:</strong> {t('privacy_policy.provide_maintain_app_text')}</li>
                <li><strong>{t('privacy_policy.improve_app_heading')}:</strong> {t('privacy_policy.improve_app_text')}</li>
                <li><strong>{t('privacy_policy.security_fraud_heading')}:</strong> {t('privacy_policy.security_fraud_text')}</li>
                <li><strong>{t('privacy_policy.communicate_heading')}:</strong>
                    <ul>
                        <li><strong>{t('privacy_policy.account_comm_heading')}:</strong> {t('privacy_policy.account_comm_text')}</li>
                        <li><strong>{t('privacy_policy.marketing_prompts_heading')}:</strong> {t('privacy_policy.marketing_prompts_text')}</li>
                    </ul>
                </li>
                <li><strong>{t('privacy_policy.personalization_advertising_heading')}:</strong> {t('privacy_policy.personalization_advertising_text')}</li>
            </ul>

            <h2>{t('privacy_policy.section_4_title')}</h2>
            <p>{t('privacy_policy.section_4_para_1')}</p>
            <ul>
                <li><strong>{t('privacy_policy.service_providers_heading')}:</strong> {t('privacy_policy.service_providers_text')}</li>
                <li><strong>{t('privacy_policy.legal_reasons_heading')}:</strong> {t('privacy_policy.legal_reasons_text')}</li>
                <li><strong>{t('privacy_policy.business_transfers_heading')}:</strong> {t('privacy_policy.business_transfers_text', { companyName: "DPDigital" })}</li>
            </ul>

            <h2>{t('privacy_policy.section_5_title')}</h2>
            <p>{t('privacy_policy.section_5_para_1')}</p>
            <p>{t('privacy_policy.section_5_para_2')}</p>

            <h2>{t('privacy_policy.section_6_title')}</h2>
            <p>{t('privacy_policy.section_6_para_1')}</p>
            <ul>
                <li><strong>{t('privacy_policy.right_to_be_informed_heading')}:</strong> {t('privacy_policy.right_to_be_informed_text')}</li>
                <li><strong>{t('privacy_policy.right_to_access_heading')}:</strong> {t('privacy_policy.right_to_access_text')}</li>
                <li><strong>{t('privacy_policy.right_to_rectification_heading')}:</strong> {t('privacy_policy.right_to_rectification_text')}</li>
                <li><strong>{t('privacy_policy.right_to_erasure_heading')}:</strong> {t('privacy_policy.right_to_erasure_text', { supportEmail: supportEmail })}</li>
                <li><strong>{t('privacy_policy.right_to_restrict_processing_heading')}:</strong> {t('privacy_policy.right_to_restrict_processing_text')}</li>
                <li><strong>{t('privacy_policy.right_to_data_portability_heading')}:</strong> {t('privacy_policy.right_to_data_portability_text')}</li>
                <li><strong>{t('privacy_policy.right_to_object_heading')}:</strong> {t('privacy_policy.right_to_object_text')}</li>
                <li><strong>{t('privacy_policy.right_to_automated_decisions_heading')}:</strong> {t('privacy_policy.right_to_automated_decisions_text')}</li>
                <li><strong>{t('privacy_policy.right_to_withdraw_consent_heading')}:</strong> {t('privacy_policy.right_to_withdraw_consent_text')}</li>
            </ul>
            <p>{t('privacy_policy.section_6_contact_text', { supportEmail: supportEmail })}</p>

            <h2>{t('privacy_policy.section_7_title')}</h2>
            <p>{t('privacy_policy.section_7_para_1', { country: "UK" })}</p>

            <h2>{t('privacy_policy.section_8_title')}</h2>
            <p>{t('privacy_policy.section_8_para_1', { sitename: sitename })}</p>

            <h2>{t('privacy_policy.section_9_title')}</h2>
            <p>{t('privacy_policy.section_9_para_1')}</p>

            <h2>{t('privacy_policy.section_10_title')}</h2>
            <p>{t('privacy_policy.section_10_para_1')}</p>
            <p>
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>

            <h2>{t('privacy_policy.section_11_title')}</h2>
            <p>{t('privacy_policy.section_11_para_1', { icoLink: "https://ico.org.uk/" })}</p>

        </div>
    );
}

export default PrivacyPolicy;