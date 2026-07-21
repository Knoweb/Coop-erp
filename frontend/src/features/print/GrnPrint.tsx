import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { PrintPageWrapper, PrintHeader, PrintActions, SignatureSection, PrintableTable } from '../../components/print';

interface GrnItem {
  id: number;
  itemName: string;
  itemSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productCode?: string;
  productId?: string;
  productName?: string;
  receivedQuantity: number;
}

interface GrnData {
  id: number;
  grnNumber: string;
  grnDate: string;
  supplierName: string;
  totalAmount: number;
  items: GrnItem[];
  createdBy: string;
  status: string;
}

interface Column<T> {
  header: string;
  accessor: (row: T, idx?: number) => string | number | React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export const GrnPrint: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<GrnData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/admin/print/grn/${id}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch GRN data for print', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading GRN data...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>GRN not found.</div>;

  const columns: Column<GrnItem>[] = [
    { header: '#', accessor: (_row: GrnItem, idx?: number) => String((idx || 0) + 1), width: '5%' },
    { header: 'Item Code', accessor: (row: GrnItem) => row.productCode || row.productId || '-', width: '15%' },
    { header: 'Product Description', accessor: (row: GrnItem) => row.productName || row.itemName, width: '30%' },
    { header: 'Qty', accessor: (row: GrnItem) => String(row.receivedQuantity), width: '10%', align: 'right' },
    { header: 'Unit Price', accessor: (row: GrnItem) => Number(row.unitPrice).toFixed(2), width: '15%', align: 'right' },
    { header: 'Total', accessor: (row: GrnItem) => (row.receivedQuantity * row.unitPrice).toFixed(2), width: '15%', align: 'right' }
  ];

  const meta = [
    { label: 'Supplier', value: data.supplierName },
    { label: 'Date', value: data.grnDate },
    { label: 'Created By', value: data.createdBy }
  ];

  const rightMeta = [
    { label: 'Status', value: data.status }
  ];

  return (
    <PrintPageWrapper>
      <PrintActions />
      <PrintHeader 
        title="GOODS RECEIPT NOTE (GRN)" 
        documentNumber={data.grnNumber} 
        meta={meta}
        rightMeta={rightMeta}
      />
      
      <PrintableTable 
        columns={columns} 
        data={data.items} 
        totalLabel="Grand Total"
        totalValue={data.totalAmount.toFixed(2)}
      />

      <SignatureSection />
    </PrintPageWrapper>
  );
};
