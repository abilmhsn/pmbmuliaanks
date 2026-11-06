'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Check, Loader2, Building2 } from 'lucide-react';
import { searchCities, CityRegion, ALL_CITIES } from '@/data/indonesiaRegions';

interface CityAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  id?: string;
}

export default function CityAutocomplete({
  label,
  value,
  onChange,
  placeholder = 'Ketik nama kota/kabupaten lahir...',
  required = false,
  helperText,
  id,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CityRegion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync external value changes into local inputValue
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // If user typed something but didn't pick from list, revert or keep selected
        if (value && inputValue !== value) {
          setInputValue(value);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value, inputValue]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Handle typing & query search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    setHighlightedIndex(0);

    if (text.trim().length > 0) {
      setIsSearching(true);
      const results = searchCities(text, 15);
      setSuggestions(results);
      setIsOpen(true);
      setIsSearching(false);
    } else {
      // If empty, show first 10 popular/major cities as guidance
      setSuggestions(ALL_CITIES.slice(0, 10));
      setIsOpen(true);
    }
  };

  const handleFocus = () => {
    if (inputValue.trim().length > 0) {
      const results = searchCities(inputValue, 15);
      setSuggestions(results);
    } else {
      setSuggestions(ALL_CITIES.slice(0, 10));
    }
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleSelect = (item: CityRegion) => {
    setInputValue(item.name);
    onChange(item.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions(ALL_CITIES.slice(0, 10));
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex]);
      }
    }
  };

  // Check if currently selected value matches a valid city
  const isExactSelected = Boolean(
    value && ALL_CITIES.some((c) => c.name.toLowerCase() === value.toLowerCase()),
  );

  return (
    <div className="relative" ref={containerRef}>
      <label
        htmlFor={id}
        className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between"
      >
        <span>
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {isExactSelected && (
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Terverifikasi</span>
          </span>
        )}
      </label>

      {/* Input container */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
          ) : (
            <MapPin className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          required={required}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm focus:outline-none ${
            isOpen
              ? 'border-sky-500 ring-2 ring-sky-500/20'
              : isExactSelected
              ? 'border-emerald-300 focus:border-sky-500'
              : 'border-slate-300 focus:border-sky-500'
          }`}
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            title="Hapus"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      )}

      {/* Autocomplete Dropdown list */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">
              {inputValue.trim()
                ? `Hasil pencarian untuk "${inputValue}"`
                : 'Pilih kota / kabupaten tempat lahir:'}
            </span>
            <span className="text-[10px] text-slate-400">
              {suggestions.length} opsi
            </span>
          </div>

          <ul
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto divide-y divide-slate-50 p-1.5 focus:outline-none scrollbar-thin"
          >
            {suggestions.length === 0 ? (
              <li className="p-4 text-center text-xs text-slate-400">
                <Building2 className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-600">
                  Kota / Kabupaten tidak ditemukan
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pastikan penulisan nama kota atau kabupaten benar
                </p>
              </li>
            ) : (
              suggestions.map((item, idx) => {
                const isSelected = item.name === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <li
                    key={`${item.name}-${item.province}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-sky-50 font-bold text-sky-900'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="truncate">{item.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {item.type}
                        </span>
                        <span>Provinsi {item.province}</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                      Pilih
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
