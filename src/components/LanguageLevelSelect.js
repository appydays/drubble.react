import React from 'react';
import './css/LanguageLevelSelect.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faBook, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const LanguageLevelSelect = ({ onLevelChange, initialLevel }) => {

    const { t } = useTranslation();

    const languageLevels = {
        1: { label: t('language-level.beginner.label'), icon: faBook, description: t('language-level.beginner.description') },
        2: { label: t('language-level.intermediate.label'), icon: faGraduationCap, description: t('language-level.intermediate.description') },
        3: { label: t('language-level.advanced.label'), icon: faStar, description: t('language-level.advanced.description') },
    };

    return (
        <div className="language-level-select">
            <p>{t('language-level.title')}</p>
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
                            <FontAwesomeIcon
                                icon={data.icon}
                                className="level-icon"
                            />
                            <span className="custom-radio-text">
                                <strong>{data.label}</strong>
                                {parseInt(level) === initialLevel && ( // Conditionally render description
                                    <span className="description">{data.description}</span>
                                )}
                            </span>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default LanguageLevelSelect;