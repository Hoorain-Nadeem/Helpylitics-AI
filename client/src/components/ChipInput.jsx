import { useState } from 'react';
import { X } from 'lucide-react';

export default function ChipInput({ value, onChange, placeholder = 'Type and press Enter' }) {
  const [text, setText] = useState('');
  const add = (raw) => {
    const v = raw.trim().toLowerCase();
    if (v && !value.includes(v)) onChange([...value, v]);
    setText('');
  };
  return (
    <div className="chips-in">
      {value.map((v) => (
        <span key={v} className="chip brand">{v}
          <button type="button" aria-label={`Remove ${v}`} style={{ border: 0, background: 'none', display: 'grid' }} onClick={() => onChange(value.filter((x) => x !== v))}><X size={12} /></button>
        </span>
      ))}
      <input
        value={text} placeholder={placeholder} aria-label={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text); }
          if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => add(text)}
      />
    </div>
  );
}
