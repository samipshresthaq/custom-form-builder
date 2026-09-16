import React, { memo } from 'react';
import './Badge.scss';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'neutral' | 'blue' | 'green' | 'amber' | 'purple' | 'red';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
  title: string;
}

export const Badge = memo<BadgeProps>(
  ({ children, variant = 'neutral', size = 'sm', className = '', icon, title }) => {
    const classes = ['badge', `badge--${size}`, `badge--${variant}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <span className={classes} >
        {icon && <span className="test badge__icon">{icon}</span>}
        <span className="test badge__icon">{title}</span>
        {children && <span className="badge__text">{children}</span>}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
