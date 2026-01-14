import React from 'react';
import { Button } from './button';
import { cn } from './utils';

interface CasinoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Standardized button component for Placebo Casino
 * 
 * Variants:
 * - Primary: Gradient purple→pink, most prominent (for main CTAs)
 * - Secondary: Outline style, less prominent (for secondary actions)
 * - Tertiary: Text-only or subtle style (for minor actions)
 * 
 * Sizes:
 * - sm: Height 36px (compact controls)
 * - md: Height 44px (standard desktop)
 * - lg: Height 56px (hero CTAs)
 */
export function CasinoButton({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className,
  children,
  ...props 
}: CasinoButtonProps) {
  
  const baseStyles = "transition-all duration-200 ease-out rounded-xl";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-[#6b46ff] to-[#ff2b9e] hover:from-[#5a38e6] hover:to-[#e6278f] text-white shadow-lg shadow-[#ff2b9e]/30 hover:shadow-xl hover:shadow-[#ff2b9e]/50 hover:-translate-y-0.5",
    secondary: "bg-transparent border-2 border-[#6b46ff]/40 hover:border-[#6b46ff] text-white hover:bg-[#6b46ff]/10 hover:-translate-y-0.5",
    tertiary: "bg-transparent text-[#6b46ff] hover:text-[#ff2b9e] hover:bg-white/5"
  };
  
  const sizeStyles = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <Button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
