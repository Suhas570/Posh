import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) => {
  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick 
    ? {
        whileHover: hoverEffect ? { y: -3, scale: 1.005 } : {},
        whileTap: { scale: 0.995 },
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      } 
    : {};

  return (
    <CardComponent
      onClick={onClick}
      className={`bg-white border border-slate-200/50 rounded-[20px] shadow-premium ${
        hoverEffect && !onClick ? 'hover:shadow-premium-hover hover:border-brand-200/40 hover:-translate-y-1 transition-all duration-300' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
