import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { PrintPageWrapper, PrintHeader, PrintActions, SignatureSection, PrintableTable } from '../../components/print';

interface SessionData {
  id: number;
  sessionNumber: string;
  openingTime: string;
  closingTime: string;
  openingBalance: number;
  closingBalance: number;
  expectedBalance: number;
  difference: number;
  cashierName: string;
  status: string;
  notes: string;
  denominations: {
    noteValue: number;
    count: number;
    total: number;
  }[];
}

export const CashClosingPrint: React.FC = () => {
  const { sessionId } = useParams();
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/shop/print/cash-sessions/${sessionId}/closing-sheet`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch session data for print', error);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading session data...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Session not found.</div>;

  const denomColumns = [
    { header: 'Denomination', accessor: (row: any) => row.noteValue, align: 'right' as const, width: '33%' },
    { header: 'Count', accessor: (row: any) => row.count, align: 'right' as const, width: '33%' },
    { header: 'Total', accessor: (row: any) => row.total.toFixed(2), align: 'right' as const, width: '34%' }
  ];

  const meta = [
    { label: 'Session No', value: data.sessionNumber },
    { label: 'Cashier', value: data.cashierName },
    { label: 'Opened At', value: new Date(data.openingTime).toLocaleString() }
  ];

  const rightMeta = [
    { label: 'Status', value: data.status },
    { label: 'Closed At', value: data.closingTime ? new Date(data.closingTime).toLocaleString() : '-' }
  ];

  return (
    <PrintPageWrapper>
      <PrintActions />
      <PrintHeader 
        title="CASHIER CLOSING SHEET" 
        meta={meta}
        rightMeta={rightMeta}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ width: '45%' }}>
          <h3>Session Summary</h3>
          <table className="print-table">
            <tbody>
              <tr>
                <td>Opening Balance</td>
                <td className="numeric">{data.openingBalance.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Expected Closing Balance</td>
                <td className="numeric">{data.expectedBalance.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Actual Declared Balance</td>
                <td className="numeric"><strong>{data.closingBalance.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td>Difference (Short/Over)</td>
                <td className="numeric" style={{ color: data.difference < 0 ? 'red' : 'inherit' }}>
                  {data.difference.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          
          {data.notes && (
            <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '0.5rem' }}>
              <strong>Notes:</strong> {data.notes}
            </div>
          )}
        </div>
        
        <div style={{ width: '45%' }}>
          <h3>Cash Denominations</h3>
          {data.denominations && data.denominations.length > 0 ? (
            <PrintableTable 
              columns={denomColumns} 
              data={data.denominations} 
              totalLabel="Total Cash"
              totalValue={data.denominations.reduce((sum, d) => sum + d.total, 0).toFixed(2)}
            />
          ) : (
            <p>No denominations recorded.</p>
          )}
        </div>
      </div>

      <SignatureSection signatures={['Cashier Signature', 'Manager/Checker Signature']} />
    </PrintPageWrapper>
  );
};
