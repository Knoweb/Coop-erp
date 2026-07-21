import React from 'react';
import './PrintStyles.css';

interface PrintPageWrapperProps {
  children: React.ReactNode;
}

export const PrintPageWrapper: React.FC<PrintPageWrapperProps> = ({ children }) => {
  return (
    <div className="print-page-wrapper">
      <div className="print-content">
        {children}
      </div>
    </div>
  );
};
