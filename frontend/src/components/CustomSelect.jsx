import React from 'react';
import Select from 'react-select';

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  isClearable = false,
  className = "",
  icon = null
}) {
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || null;

  const handleChange = (selected) => {
    if (selected) {
      onChange(selected.value);
    } else {
      onChange(""); 
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderRadius: '12px',
      borderColor: state.isFocused ? '#0b659a' : '#d6dee8',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(11, 101, 154, 0.2)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#0b659a' : '#0b659a40'
      },
      paddingLeft: icon ? '28px' : '4px',
      backgroundColor: disabled ? '#F3F4F6' : '#ffffff',
      transition: 'all 0.2s ease',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      border: '1px solid #d6dee8',
      boxShadow: '0 10px 25px -5px rgba(11, 101, 154, 0.1), 0 8px 10px -6px rgba(11, 101, 154, 0.1)',
      overflow: 'hidden',
      zIndex: 50
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px'
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: state.isSelected 
        ? '#0b659a' 
        : state.isFocused 
          ? '#e8f1f8' 
          : 'transparent',
      color: state.isSelected 
        ? '#ffffff' 
        : state.isFocused 
          ? '#0b659a' 
          : '#1e293b',
      padding: '8px 12px',
      margin: '2px 0',
      fontWeight: state.isSelected ? '600' : '400',
      '&:active': {
        backgroundColor: '#0b659a',
        color: '#ffffff'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: disabled ? '#9ca3af' : '#1f2937',
      fontWeight: '500'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af'
    }),
    indicatorSeparator: () => ({
      display: 'none' 
    })
  };

  return (
    <div className={"relative ${className}"}> 
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400">
          {icon}
        </div>
      )}
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={normalizedOptions}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={isClearable}
        styles={customStyles}
        menuPlacement="auto"
      />
    </div>
  );
}
