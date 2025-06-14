import React, { useEffect, useState } from "react";

const LetterTiles = () => {
    const [letters, setLetters] = useState([]);
    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';

    useEffect(() => {

        fetch(`${apiUrl}/daily-letters`)
            .then((response) => response.json())
            .then((data) => setLetters(data.letters))  // Assuming API returns { letters: ["A", "B", "C", ...] }
            .catch((error) => console.error("Error fetching letters:", error));
    }, []);

    return (
        <div className="tile-container">
            {letters.map((letter, index) => (
                <div key={index} className="tile">
                    {letter}
                </div>
            ))}
        </div>
    );
};

export default LetterTiles;