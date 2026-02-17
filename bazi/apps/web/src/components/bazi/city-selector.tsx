'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { CITIES, type City } from '@/data/cities';

interface CitySelectorProps {
  value: City | null;
  onChange: (city: City | null) => void;
  placeholder?: string;
  noResultsText?: string;
}

export function CitySelector({
  value,
  onChange,
  placeholder = '',
  noResultsText = '',
}: CitySelectorProps) {
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = query.trim()
    ? CITIES.filter((c) => {
        const q = query.trim().toLowerCase();
        return (
          c.zh.includes(q) ||
          c.pinyin.includes(q) ||
          c.en.toLowerCase().includes(q)
        );
      })
    : [];

  const displayName = useCallback(
    (city: City) => {
      if (locale === 'zh') {
        return `${city.zh}（${city.provinceZh}）`;
      }
      return `${city.en} (${city.provinceEn})`;
    },
    [locale],
  );

  const handleSelect = useCallback(
    (city: City) => {
      onChange(city);
      setQuery('');
      setIsOpen(false);
    },
    [onChange],
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIndex]) {
        handleSelect(filtered[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <span>{displayName(value)}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      )}

      {isOpen && query.trim() && (
        <ul
          ref={listRef}
          className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {filtered.length > 0 ? (
            filtered.map((city, i) => (
              <li
                key={city.id}
                onMouseDown={() => handleSelect(city)}
                onMouseEnter={() => setHighlightIndex(i)}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  i === highlightIndex
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700'
                }`}
              >
                <span className="font-medium">
                  {locale === 'zh' ? city.zh : city.en}
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  {locale === 'zh' ? city.provinceZh : city.provinceEn}
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  {city.longitude}°
                </span>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-400">
              {noResultsText}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
