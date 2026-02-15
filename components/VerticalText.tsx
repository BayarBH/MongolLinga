import React from 'react';

interface VerticalTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export const VerticalText: React.FC<VerticalTextProps> = ({ text, className = "", style = {} }) => {
  return (
    <div 
      className={`font-mongolian writing-vertical-lr leading-loose select-none ${className}`}
      style={style}
    >
      {text}
    </div>
  );
};