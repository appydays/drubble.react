import React from 'react';
import { FaFacebook, FaEnvelope, FaMobileAlt } from "react-icons/fa";
import './css/SocialShare.css';

const siteUrl = "https://scramair.cymru/share";
const shareUrlMobile = "https://scramair.cymru";

const SocialShare = ({ score, playerName }) => {
    const shareText = `Sgoriodd ${playerName} ${score} o bwyntiau ar ScramAir! Allwch chi ei guro?`;
    const shareUrl = `${siteUrl}?playerName=${playerName}&score=${score}`;

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const emailUrl = `mailto:?subject=Sgoriais i ${score} ar Scramair!&body=${encodeURIComponent(shareText)}%0AChwarae yma: ${shareUrlMobile}`;

    const handleMobileShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Sgôr Scramair!',
                    text: shareText,
                    url: shareUrlMobile,
                });
            } else {
                alert("Ni chefnogir rhannu ar y ddyfais hon.");
            }
        } catch (err) {
            console.error("Share failed:", err);
        }
    };

    return (
        <div className="social-share">
            <h4>Rhannwch eich sgôr!</h4>
            <div className="share-buttons">
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="btn facebook">
                    <FaFacebook size={18} style={{ marginRight: "8px" }} />
                    Rhannu ar Facebook
                </a>

                <a href={emailUrl} className="btn email">
                    <FaEnvelope size={18} style={{ marginRight: "8px" }} />
                    Rhannu trwy E-bost
                </a>

                {/* Mobile native share */}
                {navigator.share && (
                    <button className="btn mobile" onClick={handleMobileShare}>
                        <FaMobileAlt size={18} style={{ marginRight: "8px" }} />
                        Rhannu ar Symudol
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialShare;
