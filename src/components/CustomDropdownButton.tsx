import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import './CustomDropdownButton.css';

interface CustomDropdownButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  isOpen?: boolean;
}

const CustomDropdownButton: React.FC<CustomDropdownButtonProps> = ({
  label,
  onClick,
  className = '',
  isOpen = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`custom-dropdown-button w-full flex items-center justify-between py-4 px-8 rounded-full 
      text-gray-800 text-xl font-semibold shadow-md 
      border-2 border-neural-purple bg-white 
      hover:bg-gray-50 ${isOpen ? 'dropdown-open' : ''} ${className}`}
    >
      <span>{label}</span>
      <ChevronDownIcon className="dropdown-chevron w-8 h-8 text-neural-purple" />
    </button>
  );
};

export default CustomDropdownButton; 