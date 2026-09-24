import { forwardRef, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-btn hover:shadow-btn-hover',
  secondary: 'bg-bg-secondary text-text-primary hover:bg-bg-hover border border-border',
  ghost: 'bg-transparent text-text-secondary hover:text-primary hover:bg-bg-secondary',
  danger: 'bg-danger text-white hover:bg-red-600 shadow-btn hover:shadow-btn-hover',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-[13px] py-1.5 px-3 gap-1.5',
  md: 'text-sm py-2.5 px-4 gap-2',
  lg: 'text-[15px] py-3 px-5 gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', icon, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`press inline-flex items-center justify-center font-bold rounded-xl select-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
