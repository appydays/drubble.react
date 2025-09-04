import React from 'react';
import { useTranslation } from 'react-i18next';

const ReferralCodeSelect = ({ codes, siteName, selectedCode, onCodeChange, otherText, onOtherTextChange }) => {
    const { t } = useTranslation();
    return (
        <div className="form-field-group referral">
            <label htmlFor="referralCode">{t('referral.title')}</label>
            <select
                id="referralCode"
                name="referral_from_code"
                value={selectedCode}
                onChange={onCodeChange}
                className="form-control"
            >
                <option value="">{t('referral.placeholder')}</option>
                {codes.map((code) => (
                    <option key={code.id} value={code.id}>
                        {code.name}
                    </option>
                ))}
            </select>

            {selectedCode === '99' && (
                <div className="form-field-group referral">
                    <label htmlFor="otherReferralText">{t('referral.other_label')}</label>
                    <input
                        type="text"
                        id="otherReferralText"
                        name="referral_other"
                        value={otherText}
                        placeholder={t('referral.other_placeholder', {siteName: siteName})}
                        onChange={onOtherTextChange}
                        className="form-control"
                    />
                </div>
            )}

        </div>
    );
};

export default ReferralCodeSelect;
