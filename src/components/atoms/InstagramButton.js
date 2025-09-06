import React from 'react';

const InstagramButton = () => {
    const instagramUsername = 'drubble.game.uk';
    const instagramUrl = `https://www.instagram.com/${instagramUsername}`;

    return (
        <a className="btn facebook" href={instagramUrl} target="_blank" rel="noopener noreferrer">Follow us on Instagram!</a>
    );
};

export default InstagramButton;
