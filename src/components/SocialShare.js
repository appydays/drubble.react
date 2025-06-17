import React from 'react';
import { FaFacebook, FaEnvelope, FaMobileAlt } from "react-icons/fa";
import './css/SocialShare.css';

const siteUrl = "https://drubble.uk/share";
const shareUrlMobile = "https://drubble.uk";

const SocialShare = ({ score, playerName }) => {
    const shareText = `${playerName} scored ${score} points on Drubble! Can you beat it?`;
    const shareUrl = `${siteUrl}?playerName=${playerName}&score=${score}`;

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const emailUrl = `mailto:?subject=I scored ${score} on Drubble!&body=${encodeURIComponent(shareText)}%0APlay here: ${shareUrlMobile}`;

    const handleMobileShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Drubble score!',
                    text: shareText,
                    url: shareUrlMobile,
                });
            } else {
                alert("Sharing is not supported on this device.");
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    return (
        <div className="social-share">
            <h4>Share your score!</h4>
            <div className="share-buttons">
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="btn facebook">
                    <FaFacebook size={18} style={{ marginRight: "8px" }} />
                    Share on Facebook
                </a>

                <a href={emailUrl} className="btn email">
                    <FaEnvelope size={18} style={{ marginRight: "8px" }} />
                    Share by E-mail
                </a>

                {/* Mobile native share */}
                {navigator.share && (
                    <button className="btn mobile" onClick={handleMobileShare}>
                        <FaMobileAlt size={18} style={{ marginRight: "8px" }} />
                        Share from this device
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialShare;
