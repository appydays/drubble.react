// This file defines the reusable PersonWithHeartsIcon component.

import React from 'react';
import { FaUser, FaHeart } from "react-icons/fa";
import '../css/PersonWithHeartsIcon.css';

/**
 * A reusable icon component that displays a person with a dynamic number of hearts.
 *
 * @param {object} props The component props.
 * @param {number} [props.numberOfHearts=3] The number of heart icons to display. Defaults to 3.
 */
const PersonWithHeartsIcon = ({ numberOfHearts = 3 }) => {
    // Ensure the number of hearts is a positive integer, with a maximum of 10 for a clean look.
    const heartCount = Math.max(1, Math.min(10, numberOfHearts));

    // Create an array of hearts to render dynamically.
    const hearts = Array.from({ length: heartCount }, (_, index) => (
        <FaHeart key={index} size={20} />
    ));

    return (
        <div className="icon-container">
            {/* Container for the main user icon */}
            <div className="user-icon-wrapper">
                {/* The person icon itself, with a larger size */}
                <FaUser size={40} className="user-icon" />
            </div>
            {/* Container for the hearts */}
            <div className="hearts-container">
                {hearts}
            </div>
        </div>
    );
};

export default PersonWithHeartsIcon;
