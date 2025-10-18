import { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className = ''
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const removeTag = (optionToRemove: string) => {
    onChange(value.filter(v => v !== optionToRemove));
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected tags */}
      <div className="min-h-[40px] p-2 border border-gray-300 rounded-lg bg-white flex flex-wrap gap-1">
        {value.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-primary-600 hover:text-primary-800"
            >
              ×
            </button>
          </span>
        ))}

        {/* Input for new selections */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={() => setIsOpen(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 outline-none text-sm min-w-[120px]"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No options found</div>
          ) : (
            filteredOptions.map(option => (
              <div
                key={option}
                className={`p-2 cursor-pointer hover:bg-gray-50 ${
                  value.includes(option) ? 'bg-primary-50 text-primary-800' : ''
                }`}
                onClick={() => toggleOption(option)}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  onChange={() => {}}
                  className="mr-2"
                />
                {option}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
