import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
export const Button = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button 
    {...props} 
    className={clsx(
      "w-full bg-gradient-to-r from-accent-dark to-accent-color text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:from-accent-dark/90 hover:to-accent-color/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm sm:text-base", 
      className
    )} 
  />
);