import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PrintActionsProps {
  onBack?: () => void;
}

export const PrintActions: React.FC<PrintActionsProps> = ({ onBack }) => {
  const navigate = useNavigate();
  
  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="print-actions-bar no-print">
      <button className="secondary" onClick={handleBack}>
        ← Back
      </button>
      <button onClick={handlePrint}>
        Print Document
      </button>
    </div>
  );
};
