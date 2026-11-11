import { Globe2, Square, ArrowUp } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import './AuditPromptBar.css';

interface AuditPromptBarProps {
  value: string;
  busy: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

/** A compact prompt-style URL composer for starting a CRO audit. */
export default function AuditPromptBar({ value, busy, onChange, onSend }: AuditPromptBarProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && value.trim() && !busy) onSend();
  };

  return (
    <div className="audit-prompt-bar">
      <div className="audit-prompt-input-row">
        <Globe2 size={18} strokeWidth={1.8} aria-hidden="true" />
        <input
          id="audit-url"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="Paste your website URL"
          value={value}
          disabled={busy}
          aria-label="Website URL"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="audit-prompt-actions">
        <span className="audit-prompt-mode"><Globe2 size={14} aria-hidden="true" /> Website audit</span>
        <button
          type="button"
          className="audit-prompt-send"
          aria-label={busy ? 'Audit in progress' : 'Run audit'}
          aria-busy={busy}
          disabled={busy || !value.trim()}
          onClick={onSend}
        >
          {busy ? <Square size={14} fill="currentColor" aria-hidden="true" /> : <ArrowUp size={19} strokeWidth={2.5} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
