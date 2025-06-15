import React from 'react';
import './css/WordLengthHistogram.css';

const WordLengthHistogram = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return <p>There is no histogram data to view.</p>;
    }

    // Find the maximum count to normalize the bar lengths
    const maxCount = Math.max(...Object.values(data));

    return (
        <div className="word-length-histogram">
            <h3>Word Lengths you have used</h3>
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
                                title={`${count} words of ${length} llythren`}
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