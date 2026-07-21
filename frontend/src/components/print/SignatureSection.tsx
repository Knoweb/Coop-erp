import React from 'react';

interface SignatureSectionProps {
  signatures?: string[];
}

export const SignatureSection: React.FC<SignatureSectionProps> = ({ 
  signatures = ['Prepared By', 'Checked By', 'Authorized By'] 
}) => {
  return (
    <div className="print-signatures">
      {signatures.map((sig, idx) => (
        <div key={idx} className="signature-block">
          <div className="signature-line"></div>
          <div>{sig}</div>
        </div>
      ))}
    </div>
  );
};
