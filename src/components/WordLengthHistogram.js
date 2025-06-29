import React from 'react';
import './css/WordLengthHistogram.css';
import { useTranslation } from 'react-i18next';

const WordLengthHistogram = ({ data }) => {
    const { t, i18n } = useTranslation();

    if (!data || Object.keys(data).length === 0) {
        return <p>{t('leaderboard.stats.histogram.no-data')}</p>;
    }

    // Find the maximum count to normalize the bar lengths
    const maxCount = Math.max(...Object.values(data));

    return (
        <div className="word-length-histogram">
            <h3>{t('leaderboard.stats.histogram.title')}</h3>
            {Object.entries(data).map(([length, count]) => {
                // Calculate bar width as a percentage of the maxCount
                const barWidth = (count / maxCount) * 100;
                return (
                    <div className="histogram-row" key={length}>
                        <span className="length-label">{length}</span>
                        <div className="bar-container">
                            <div
                                className="histogram-bar"
                                style={{ width: `${barWidth}%` }}
                                title={t('leaderboard.stats.histogram.row-title',{count: count,length:length})}
                            ></div>
                            <span className="count-label">{count}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default WordLengthHistogram;