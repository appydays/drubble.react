import React from 'react';

const InstagramButton = () => {
    const instagramUsername = 'drubble.game.uk';
    const instagramUrl = `https://www.instagram.com/${instagramUsername}`;

    return (
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <button>
                Follow us on Instagram!
            </button>
        </a>
    );
};

export default InstagramButton;
