import React, { useState, useRef, useEffect, FC, ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  id: string;
  label: string;
}

interface CustomSelectProps {
  value?: string;
  onChange: (event: { target: { value: string } }) => void;
  options: Option[];
  placeholder: string;
  required?: boolean;
}

const CustomSelect: FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const selected = options.find((opt) => opt.id === value);
    setSelectedLabel(selected ? selected.label : "");
  }, [value, options]);

  const handleSelect = (option: Option): void => {
    onChange({ target: { value: option.id } });
    setIsOpen(false);
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    // This is for the hidden select, we don't actually use this
    // but we need it for TypeScript
    console.log(e.target.value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-right flex justify-between items-center ${
          !selectedLabel ? "text-gray-500" : "text-white"
        }`}
      >
        <span>{selectedLabel || placeholder}</span>
        <ChevronDown
          className={`transition-transform duration-0 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-4 py-2.5 text-right text-white hover:bg-orange-500 transition-colors ${
                value === option.id ? "bg-orange-500" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Hidden select for form validation */}
      <select
        value={value}
        onChange={handleSelectChange}
        required={required}
        className="sr-only"
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomSelect;
