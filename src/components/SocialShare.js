import React from 'react';
import { FaFacebook, FaEnvelope, FaMobileAlt } from "react-icons/fa";
import './css/SocialShare.css';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

const siteUrl = `${process.env.REACT_APP_URL}/share`;
const shareUrlMobile = process.env.REACT_APP_URL;

const SocialShare = ({ score, playerName }) => {
    const { t } = useTranslation();
    const siteName = process.env.REACT_APP_SITE_NAME;

    const shareText = t('social-share.share-text',{playerName: playerName, score: score, siteName: siteName});
    const shareUrl = `${siteUrl}?playerName=${playerName}&score=${score}`;

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const emailUrl = t('social-share.email-url',{score: score,siteName: siteName, emailBody: encodeURIComponent(shareText), shareUrl: shareUrlMobile});


    const handleMobileShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Sgôr ${process.env.REACT_APP_SITE_NAME}!`,
                    text: shareText,
                    url: shareUrlMobile,
                });
            } else {
                Swal.fire(t('social-share.device.not-supported'), t('social-share.device.not-supported-text'), 'warning');
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    return (
        <div className="social-share">
            <h4>{t('social_share.title')}</h4>
            <div className="share-buttons">
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="btn facebook">
                    <FaFacebook size={18} style={{ marginRight: "8px" }} />
                    {t('social_share.facebook')}
                </a>

                <a href={emailUrl} className="btn email">
                    <FaEnvelope size={18} style={{ marginRight: "8px" }} />
                    {t('social_share.e-mail')}
                </a>

                {/* Mobile native share */}
                {navigator.share && (
                    <button className="btn mobile" onClick={handleMobileShare}>
                        <FaMobileAlt size={18} style={{ marginRight: "8px" }} />
                        {t('social_share.mobile')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialShare;
