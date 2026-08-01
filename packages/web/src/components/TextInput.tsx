import { useState } from "react";

interface TextInputProps {
  onSynthesize: (text: string) => void;
  isLoading: boolean;
}

export function TextInput({ onSynthesize, isLoading }: TextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSynthesize(text.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-input">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to speak..."
        rows={4}
        disabled={isLoading}
      />
      <button type="submit" disabled={!text.trim() || isLoading}>
        {isLoading ? "Synthesizing..." : "Synthesize"}
      </button>
    </form>
  );
}
