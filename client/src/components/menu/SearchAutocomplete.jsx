import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { recommendationService } from '@services/recommendationService';
import { useDebounce } from '@hooks/useDebounce';

export default function SearchAutocomplete({ value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const debouncedValue = useDebounce(value, 300);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!debouncedValue || debouncedValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    recommendationService
      .getSearchSuggestions(debouncedValue)
      .then(({ data }) => setSuggestions(data.data.suggestions))
      .catch(() => setSuggestions([]));
  }, [debouncedValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isFocused && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <FiSearch className="pointer-events-none absolute top-1/2 left-1 -translate-y-1/2 text-ink/40" />
      <input
        type="search"
        placeholder="Search dishes..."
        value={value}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-ink/15 bg-transparent py-3 pl-8 font-body text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-gold"
      />

      {showDropdown && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden border border-ink/10 bg-cream shadow-[0_12px_30px_-10px_rgba(23,21,18,0.2)]">
          {suggestions.map((s) => (
            <button
              key={s._id}
              type="button"
              onClick={() => {
                setIsFocused(false);
                navigate(`/menu/${s.slug}`);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-sm transition-colors hover:bg-ink/5"
            >
              <div className="h-8 w-8 flex-shrink-0 overflow-hidden bg-ink/5">
                {s.images?.[0]?.url && (
                  <img src={s.images[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="flex-1 text-ink/80">{s.name}</span>
              <span className="text-gold">${s.price?.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
