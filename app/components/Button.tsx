import { ReactEventHandler } from "react";


export const LoadingSpinner = () => {
  return (
    <div className="inline-block mr-2 h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-transparent"></div>
  )  
}

interface ButtonProps {
  onClick: ReactEventHandler;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button = ({ onClick, children, disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center text-sm sm:text-base p-2 bg-blue-500 text-white rounded"
    >
      {children}
    </button>
  )
}
