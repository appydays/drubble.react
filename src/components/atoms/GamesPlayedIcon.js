import React from 'react';
import { FaChartBar } from "react-icons/fa";
import '../css/GamesPlayedIcon.css';

/**
 * A reusable icon component that displays a person with a dynamic number of hearts.
 *
 * @param {object} props The component props.
 * @param {number} [props.numberOfHearts=3] The number of heart icons to display. Defaults to 3.
 */
const GamesPlayedIcon = () => {

    return (
        <div className="icon-container">
            {/* Container for the main user icon */}
            <div className="user-icon-wrapper">
                {/* The person icon itself, with a larger size */}
                <FaChartBar size={40} className="user-icon" />
            </div>
        </div>
    );
};

export default GamesPlayedIcon;
