import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md';

/**
 * Button empresarial — SRP: solo presentación + accesibilidad.
 * Variantes cerradas (OCP: extender vía `variant`, no modificar estilos inline).
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-slate-100',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'text-[13px] px-2.5 py-1.5',
  md: '',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
