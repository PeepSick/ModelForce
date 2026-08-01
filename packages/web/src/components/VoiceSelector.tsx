import { useState, useEffect } from "react";

interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: string;
}

interface VoiceSelectorProps {
  provider: string;
  selectedVoice: string;
  onSelect: (voiceId: string) => void;
}

export function VoiceSelector({ provider, selectedVoice, onSelect }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/voices?provider=${provider}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVoices(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [provider]);

  if (loading) {
    return <div className="voice-selector loading">Loading voices...</div>;
  }

  return (
    <div className="voice-selector">
      <label>Voice:</label>
      <select value={selectedVoice} onChange={(e) => onSelect(e.target.value)}>
        <option value="">Select a voice</option>
        {voices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name} ({voice.language})
          </option>
        ))}
      </select>
    </div>
  );
}
