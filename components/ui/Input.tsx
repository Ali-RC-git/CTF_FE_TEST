import { forwardRef } from "react";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; error?: string; }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => (
  <div className="flex flex-col space-y-1 sm:space-y-2 w-full">
    <label className="text-xs sm:text-sm font-medium text-text-primary">{label}</label>
    <input 
      ref={ref} 
      {...props} 
      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-color focus:ring-2 focus:ring-accent-color/20 transition-colors text-sm sm:text-base" 
    />
    {error && <p className="text-xs text-danger-color">{error}</p>}
  </div>
));
Input.displayName = "Input";