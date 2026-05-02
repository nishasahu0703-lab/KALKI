
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
  headerRight?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, onBack, headerRight }) => {
  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-ios-bg overflow-hidden relative shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-50 ios-blur bg-ios-bg/80 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="p-1 -ml-2 text-ios-blue active:opacity-50 transition-opacity">
              <ChevronLeft size={28} />
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
        <div>{headerRight}</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={title}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="py-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-ios-card rounded-ios p-5 ios-shadow mb-4 ${onClick ? 'active:scale-95 transition-transform cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'blue' | 'green' | 'orange' | 'red' | 'gray' }> = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost'; 
  className?: string;
  disabled?: boolean;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "",
  disabled = false
}) => {
  const variants = {
    primary: 'bg-ios-blue text-white active:bg-blue-700',
    secondary: 'bg-white text-ios-blue border border-ios-blue active:bg-blue-50',
    ghost: 'bg-transparent text-ios-blue active:bg-blue-50',
  };
  
  return (
    <button 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full py-3.5 px-4 rounded-ios-sm font-semibold transition-all duration-200 outline-none
        ${disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50' : variants[variant]} 
        ${className}`}
    >
      {children}
    </button>
  );
};
