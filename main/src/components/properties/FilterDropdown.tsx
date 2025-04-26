import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { AnimatedDropdown } from '../shared/AnimatedDropdown';

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterDropdown = ({ label, options, value, onChange }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <span className="text-sm font-medium">{label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.button>

      <AnimatedDropdown
        isOpen={isOpen}
        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        <div className="py-1">
          {options.map((option) => (
            <motion.button
              key={option}
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`block w-full px-4 py-2 text-sm text-left ${
                value === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </AnimatedDropdown>
    </div>
  );
};