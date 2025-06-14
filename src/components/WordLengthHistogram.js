import React from 'react';
import './css/WordLengthHistogram.css';

const WordLengthHistogram = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return <p>Does dim histogram i'w weld.</p>;
    }

    // Find the maximum count to normalize the bar lengths
    const maxCount = Math.max(...Object.values(data));

    return (
        <div className="word-length-histogram">
            <h3>Hyd Geiriau rydych chi wedi'u defnyddio</h3>
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
                                title={`${count} gair o hyd ${length} llythren`}
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