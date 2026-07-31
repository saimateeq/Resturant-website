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
      <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-secondary-400" />
      <input
        type="search"
        placeholder="Search dishes..."
        value={value}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-secondary-500/20 bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-primary-500 dark:bg-secondary-800 dark:text-secondary-50"
      />

      {showDropdown && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-secondary-500/10 bg-white shadow-soft dark:bg-secondary-900">
          {suggestions.map((s) => (
            <button
              key={s._id}
              type="button"
              onClick={() => {
                setIsFocused(false);
                navigate(`/menu/${s.slug}`);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-secondary-500/5"
            >
              <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-secondary-100 dark:bg-secondary-800">
                {s.images?.[0]?.url && (
                  <img src={s.images[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="flex-1 text-secondary-700 dark:text-secondary-200">{s.name}</span>
              <span className="text-secondary-400">${s.price?.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
