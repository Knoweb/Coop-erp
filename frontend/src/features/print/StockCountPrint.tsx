import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { PrintPageWrapper, PrintHeader, PrintActions, SignatureSection, PrintableTable } from '../../components/print';

interface AdjItem {
  id: number;
  itemName: string;
  itemSku: string;
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
  unitCost: number;
  productCode?: string;
  productId?: string;
  productName?: string;
  systemQuantity: number;
  physicalQuantity: number;
}

interface AdjData {
  id: number;
  adjustmentNumber: string;
  adjustmentDate: string;
  shopName: string;
  reason: string;
  items: AdjItem[];
  createdBy: string;
  status: string;
}

interface Column<T> {
  header: string;
  accessor: (row: T, idx?: number) => string | number | React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export const StockCountPrint: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<AdjData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/admin/print/stock-counts/${id}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch stock count data for print', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading stock count data...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Stock count not found.</div>;

  const columns: Column<AdjItem>[] = [
    { header: '#', accessor: (_row: AdjItem, idx?: number) => String((idx || 0) + 1), width: '5%' },
    { header: 'Item Code', accessor: (row: AdjItem) => row.productCode || row.productId || '-', width: '15%' },
    { header: 'Description', accessor: (row: AdjItem) => row.productName || row.itemName, width: '35%' },
    { header: 'Sys Qty', accessor: (row: AdjItem) => String(row.systemQuantity), width: '15%', align: 'right' },
    { header: 'Phy Qty', accessor: (row: AdjItem) => String(row.physicalQuantity), width: '15%', align: 'right' },
    { header: 'Diff', accessor: (row: AdjItem) => String(row.difference), width: '15%', align: 'right' }
  ];

  const meta = [
    { label: 'Shop / Location', value: data.shopName },
    { label: 'Date', value: data.adjustmentDate },
    { label: 'Created By', value: data.createdBy }
  ];

  const rightMeta = [
    { label: 'Status', value: data.status },
    { label: 'Reason', value: data.reason }
  ];

  const totalDiffValue = data.items.reduce((sum, item) => sum + (item.difference * (item.unitCost || 0)), 0);

  return (
    <PrintPageWrapper>
      <PrintActions />
      <PrintHeader 
        title="STOCK COUNT / ADJUSTMENT" 
        documentNumber={data.adjustmentNumber} 
        meta={meta}
        rightMeta={rightMeta}
      />
      
      <PrintableTable 
        columns={columns} 
        data={data.items} 
        totalLabel="Total Value Difference"
        totalValue={totalDiffValue.toFixed(2)}
      />

      <SignatureSection signatures={['Counted By', 'Verified By', 'Approved By']} />
    </PrintPageWrapper>
  );
};
