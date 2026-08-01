import { useState, useEffect } from "react";

interface Provider {
  id: string;
  name: string;
  status: string;
}

interface ProviderSelectorProps {
  selectedProvider: string;
  onSelect: (providerId: string) => void;
}

export function ProviderSelector({ selectedProvider, onSelect }: ProviderSelectorProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProviders(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="provider-selector loading">Loading providers...</div>;
  }

  return (
    <div className="provider-selector">
      <label>Provider:</label>
      <select value={selectedProvider} onChange={(e) => onSelect(e.target.value)}>
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id} disabled={provider.status === "unavailable"}>
            {provider.name} ({provider.status})
          </option>
        ))}
      </select>
    </div>
  );
}
