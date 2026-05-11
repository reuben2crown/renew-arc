import * as React from "react"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = "", checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
          focus-visible:ring-blue-600 focus-visible:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          ${className}
        `}
        {...props}
      >
        <span
          className={`
            pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 
            transition duration-200 ease-in-out transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
