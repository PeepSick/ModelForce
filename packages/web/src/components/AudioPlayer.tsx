import { useState, useRef } from "react";

interface AudioPlayerProps {
  audioUrl: string | null;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!audioUrl) {
    return null;
  }

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "synthesis.wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
      />
      <div className="controls">
        <button onClick={isPlaying ? handlePause : handlePlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={handleDownload}>Download</button>
      </div>
    </div>
  );
}
