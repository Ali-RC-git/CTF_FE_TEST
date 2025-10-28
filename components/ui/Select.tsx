import { forwardRef } from "react";
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label: string; error?: string; }
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, children, ...props }, ref) => (
  <div className="flex flex-col space-y-2 w-full">
    <label className="text-sm font-medium text-text-primary">{label}</label>
    <select 
      ref={ref} 
      {...props} 
      className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-text-primary focus:outline-none focus:border-accent-color focus:ring-2 focus:ring-accent-color/20 transition-colors"
    >
      {children}
    </select>
    {error && <p className="text-xs text-danger-color">{error}</p>}
  </div>
));
Select.displayName = "Select";