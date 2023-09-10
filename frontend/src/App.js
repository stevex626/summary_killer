import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');

  const getSummary = async () => {
    try {
      const response = await axios.post('http://localhost:5000/summarize', { url });
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  return (
    <div className="container mt-5">
      <input 
        type="text" 
        className="form-control mb-3" 
        placeholder="Enter URL" 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={getSummary} className="btn btn-primary mb-3">Get Summary</button>
      <p>{summary}</p>
    </div>
  );
}

export default App;
