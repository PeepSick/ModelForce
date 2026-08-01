import { useState, useEffect } from "react";

interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: string;
  provider: string;
}

export function Voices() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState("piper");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/voices?provider=${selectedProvider}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVoices(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedProvider]);

  return (
    <div className="voices-page">
      <h1>Voices</h1>

      <div className="provider-filter">
        <label>Provider:</label>
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
        >
          <option value="piper">Piper</option>
          <option value="kokoro">Kokoro</option>
          <option value="xtts">XTTS</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading voices...</div>
      ) : (
        <div className="voice-list">
          {voices.length === 0 ? (
            <div className="empty">No voices available</div>
          ) : (
            voices.map((voice) => (
              <div key={voice.id} className="voice-card">
                <h3>{voice.name}</h3>
                <p>ID: {voice.id}</p>
                <p>Language: {voice.language}</p>
                {voice.gender && <p>Gender: {voice.gender}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
