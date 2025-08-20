import React, { useState, useEffect, useRef } from 'react';
import { FaFacebook, FaEnvelope, FaMobileAlt } from "react-icons/fa";
import './css/SocialShare.css';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

// Ensure these environment variables are correctly defined in your .env file
// Example: REACT_APP_URL=https://your-app.com
// Example: REACT_APP_SITE_NAME=MyAwesomeGame
const siteUrl = `${process.env.REACT_APP_URL}/share`; // Base URL for shareable content (with OG tags)
const siteUrlForNativeShare = process.env.REACT_APP_URL; // Or a specific URL if your native share dialog is different

const SocialShare = ({ score, playerName }) => {
    const { t } = useTranslation();
    const siteName = process.env.REACT_APP_SITE_NAME;

    // State to track if the Facebook SDK has been initialized and is ready
    const [fbSDKReady, setFbSDKReady] = useState(false);

    // Ref to store the timeout ID so we can clear it on unmount or when fallback happens
    const fallbackTimeoutRef = useRef(null);
    // Ref to store the visibility change listener reference
    const visibilityChangeListenerRef = useRef(null);

    useEffect(() => {
        const handleFbSDKLoaded = () => {
            setFbSDKReady(true);
            console.log('Facebook SDK is ready for sharing!');
        };

        // Check if FB is already available (e.g., if component mounts later)
        if (window.FB && typeof window.FB.ui === 'function') {
            // Give a tiny moment to ensure FB.init has fully settled its internal state
            setTimeout(() => {
                setFbSDKReady(true);
            }, 0);
        } else {
            // Listen for the custom event dispatched from public/index.html
            window.addEventListener('fbSDKLoaded', handleFbSDKLoaded);
        }

        // Cleanup: Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('fbSDKLoaded', handleFbSDKLoaded);
            // Also clean up any pending timeouts or event listeners if component unmounts
            if (fallbackTimeoutRef.current) {
                clearTimeout(fallbackTimeoutRef.current);
            }
            if (visibilityChangeListenerRef.current) {
                document.removeEventListener('visibilitychange', visibilityChangeListenerRef.current);
            }
        };
    }, []); // Empty dependency array means this effect runs only once

    // The URL for the content you want to share on Facebook.
    // This URL *must* have the Open Graph meta tags in its HTML head
    // so Facebook can scrape a rich preview (title, description, image).
    const shareUrlWithParams = `${siteUrl}?playerName=${playerName}&score=${score}`;
    // The text that will appear in the user's share comment box (optional)
    const shareQuote = t('social-share.share-text', { playerName: playerName, score: score, siteName: siteName });
    // A hashtag to pre-fill (optional)
    const shareHashtag = `#${siteName.replace(/\s/g, '')}Game`;

    // Helper function to trigger the Facebook Web Share Dialog (FB.ui)
    const triggerFBUiShare = () => {
        if (!fbSDKReady || !window.FB || typeof window.FB.ui !== 'function') {
            console.error('FB SDK not ready for FB.ui fallback.');
            Swal.fire(t('social-share.facebook.loading-error-title'), t('social-share.facebook.loading-error-text'), 'error');
            return;
        }

        window.FB.ui({
            method: 'share',
            href: shareUrlWithParams, // This is the URL Facebook will crawl for OG tags
            quote: shareQuote,       // Optional pre-filled text
            hashtag: shareHashtag    // Optional hashtag
        }, function(response){
            // Callback function after the share dialog closes
            if (response && !response.error_message) {
                console.log('Facebook sharing completed successfully via FB.ui.', response);
                Swal.fire(t('social-share.facebook.success.title'), t('social-share.facebook.success.text'), 'success');
            } else {
                console.log('Facebook sharing cancelled or an error may have occurred via FB.ui.', response);
                // The response might not have an error_message if simply cancelled
                if(!response.error_message) {
                    Swal.fire(t('social-share.facebook.check.title'), t('social-share.facebook.check.text'), 'success');
                } else {
                    Swal.fire(t('social-share.facebook.fail.title'), t('social-share.facebook.fail.text', {error: response.error_message || t('social-share.facebook.cancelled.text')}), 'Error');
                }
            }
        });
    };
    // --- Facebook Share Handler ---
    const handleFacebookShare = () => {
        if (!fbSDKReady) {
            console.warn('Facebook SDK not yet ready. Cannot initiate share.');
            Swal.fire(t('social-share.facebook.loading-error-title'), t('social-share.facebook.loading-error-text'), 'error');
            return;
        }
        // Directly call the FB.ui trigger
        triggerFBUiShare();
    };

    // --- Email Share (existing) ---
    const emailUrl = t('social-share.e-mail.url', {
        score: score,
        siteName: siteName,
        emailBody: encodeURIComponent(shareQuote), // Using shareQuote for email body now
        shareUrl: siteUrlForNativeShare // Or shareUrlWithParams if that's more appropriate for email
    });

    // --- Mobile Native Share (existing) ---
    const handleMobileShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${process.env.REACT_APP_SITE_NAME} score!`, // Title for the native share dialog
                    text: shareQuote, // Text for the native share dialog
                    url: siteUrlForNativeShare, // URL for the native share dialog
                });
            } else {
                Swal.fire(t('social-share.mobil.device.not-supported'), t('social-share.mobile.device.not-supported-text'), 'warning');
            }
        } catch (err) {
            console.error("Share failed:", err);
            // Handle user cancelling share dialog gracefully
            if (err.name === 'AbortError') {
                console.log('Web Share API: Share cancelled by user.');
            } else {
                Swal.fire(t('social-share.device.share-error'), err.message, 'error');
            }
        }
    };

    return (
        <div className="social-share">
            <h4>{t('social-share.title')}</h4>
            <div className="share-buttons">
                {/* Facebook Share Button (using FB.ui) */}
                {false && fbSDKReady && (
                    <button
                        onClick={handleFacebookShare}
                        className={'btn facebook'}
                    >
                        <FaFacebook size={18} style={{ marginRight: "8px" }} />
                        {t('social-share.facebook.button')}
                    </button>
                )}
                {/* Email Share Button (existing) */}
                <a href={emailUrl} className="btn email">
                    <FaEnvelope size={18} style={{ marginRight: "8px" }} />
                    {t('social-share.e-mail.button')}
                </a>

                {/* Mobile Native Share Button (existing) */}
                {navigator.share && (
                    <button className="btn mobile" onClick={handleMobileShare}>
                        <FaMobileAlt size={18} style={{ marginRight: "8px" }} />
                        {t('social-share.mobile.button')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialShare;