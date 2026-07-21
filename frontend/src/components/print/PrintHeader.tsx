import React from 'react';

interface PrintHeaderProps {
  title: string;
  documentNumber?: string;
  meta?: { label: string; value: string | React.ReactNode }[];
  rightMeta?: { label: string; value: string | React.ReactNode }[];
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ title, documentNumber, meta, rightMeta }) => {
  return (
    <>
      <div className="print-header">
        <h1>COOPFED KILINOCHCHI</h1>
        <h2>{title}</h2>
        {documentNumber && <p>No: <strong>{documentNumber}</strong></p>}
      </div>
      
      {(meta || rightMeta) && (
        <div className="print-meta">
          <div className="print-meta-column">
            {meta?.map((item, idx) => (
              <div key={idx}>
                <strong>{item.label}:</strong> {item.value}
              </div>
            ))}
          </div>
          <div className="print-meta-column" style={{ textAlign: 'right' }}>
            {rightMeta?.map((item, idx) => (
              <div key={idx}>
                <strong>{item.label}:</strong> {item.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
