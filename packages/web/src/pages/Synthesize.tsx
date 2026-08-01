import { useState } from "react";
import { TextInput } from "../components/TextInput";
import { VoiceSelector } from "../components/VoiceSelector";
import { ProviderSelector } from "../components/ProviderSelector";
import { AudioPlayer } from "../components/AudioPlayer";

export function Synthesize() {
  const [provider, setProvider] = useState("piper");
  const [voice, setVoice] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSynthesize = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch("/api/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          provider,
          voice: voice || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAudioUrl(data.data.audioUrl);
      } else {
        setError(data.error?.message || "Synthesis failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="synthesize-page">
      <h1>ModelForce Synthesize</h1>

      <div className="options">
        <ProviderSelector
          selectedProvider={provider}
          onSelect={setProvider}
        />
        <VoiceSelector
          provider={provider}
          selectedVoice={voice}
          onSelect={setVoice}
        />
      </div>

      <TextInput onSynthesize={handleSynthesize} isLoading={isLoading} />

      {error && <div className="error">{error}</div>}

      <AudioPlayer audioUrl={audioUrl} />
    </div>
  );
}
