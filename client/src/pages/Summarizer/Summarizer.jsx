import React, { useState } from 'react';
import './Summarizer.css';

const Summarizer = () => {
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSummary('');

        if (!file) {
            setError('Please upload a file.');
            return;
        }

        const formData = new FormData();
        formData.append('report', file);

        try {
            const response = await fetch('http://localhost:5000/api/summarize', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to summarize the file.');
            }

            const data = await response.json();
            setSummary(data.summary);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="summarizer-container">
            <h1>Summarizer</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button type="submit">Summarize</button>
            </form>
            {error && <p className="error">{error}</p>}
            {summary && (
                <div className="summary">
                    <h2>Summary:</h2>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
};

export default Summarizer;