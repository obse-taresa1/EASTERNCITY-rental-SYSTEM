import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

/**
 * Reusable button component with primary and secondary variants.
 * Uses CSS custom properties defined in designTokens.css for colors,
 * shadows and radii. Supports disabled state and passes through any
 * additional props (e.g., onClick, type, className).
 */
export default function Button({ children, variant = 'primary', size = 'md', disabled = false, className = '', ...rest }) {
  const variantClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  const sizeClass = `btn-${size}`;
  const classes = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
