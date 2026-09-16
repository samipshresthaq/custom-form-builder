import React, { memo } from 'react';
import './Button.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = memo<ButtonProps>(
  ({
    children,
    variant = 'secondary',
    size = 'md',
    icon,
    iconPosition = 'left',
    className = '',
    disabled,
    ...props
  }) => {
    const classes = [
      'btn',
      `btn--${size}`,
      `btn--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        type="button"
        disabled={disabled}
        className={classes}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="btn__icon">{icon}</span>}
        {children && <span className="btn__label">{children}</span>}
        {icon && iconPosition === 'right' && <span className="btn__icon">{icon}</span>}
      </button>
    );
  }
);

