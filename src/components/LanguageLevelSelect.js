// LanguageLevelSelect.js
import React from 'react';
import './css/LanguageLevelSelect.css'; // Still import CSS for base styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faBook, faGraduationCap } from '@fortawesome/free-solid-svg-icons'; // Example icons

const LanguageLevelSelect = ({ onLevelChange, initialLevel }) => {
    const languageLevels = {
        1: { label: 'Beginner', icon: faBook, description: 'In the process of learning the language' },
        2: { label: 'Intermediate', icon: faGraduationCap, description: 'Can read, write and speak the language but is not yet fluent' },
        3: { label: 'Advanced', icon: faStar, description: 'First language or now fluent in the language' },
    };

    return (
        <div className="language-level-select">
            <p>Your language level:</p>
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