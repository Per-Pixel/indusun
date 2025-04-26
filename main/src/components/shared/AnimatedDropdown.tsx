import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedDropdownProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

const dropdownVariants = {
  hidden: { 
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
    }
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
    }
  }
};

export const AnimatedDropdown = ({ isOpen, children, className = '' }: AnimatedDropdownProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`origin-top ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};