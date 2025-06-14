// LanguageLevelSelect.js
import React from 'react';
import './css/LanguageLevelSelect.css'; // Still import CSS for base styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faBook, faGraduationCap } from '@fortawesome/free-solid-svg-icons'; // Example icons

const LanguageLevelSelect = ({ onLevelChange, initialLevel }) => {
    const languageLevels = {
        1: { label: 'Dechreuwr', icon: faBook, description: 'Beginner' },
        2: { label: 'Canolradd', icon: faGraduationCap, description: 'Intermediate' },
        3: { label: 'Uwch', icon: faStar, description: 'Advanced' },
    };

    return (
        <div className="language-level-select">
            <p>Eich lefel iaith:</p>
            <div className="radio-group">
                {Object.entries(languageLevels).map(([level, data]) => (
                    <label key={level} className="custom-radio-label icon-radio-label">
                        <input
                            type="radio"
                            name="language_level"
                            value={level}
                            checked={parseInt(level) === initialLevel}
                            onChange={() => onLevelChange(parseInt(level))}
                            className="hidden-radio"
                        />
                        <div className="radio-content">
                            {/* Or a thematic icon for the level */}
                            <FontAwesomeIcon
                                icon={data.icon}
                                className="level-icon"
                            />
                            <span className="custom-radio-text">
                                <strong>{data.label}</strong>
                                <span className="description">{data.description}</span> {/* Optional description */}
                            </span>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default LanguageLevelSelect;