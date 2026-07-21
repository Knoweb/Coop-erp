import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { PrintPageWrapper, PrintHeader, PrintActions, PrintableTable } from '../../components/print';

interface SaleItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productCode?: string;
  productId?: string;
  productName?: string;
}

interface SaleData {
  id: number;
  saleNumber: string;
  saleDate: string;
  customerName: string;
  totalAmount: number;
  items: SaleItem[];
  createdBy: string;
  paymentMethod: string;
  paymentStatus: string;
}

interface Column<T> {
  header: string;
  accessor: (row: T, idx?: number) => string | number | React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export const SaleInvoicePrint: React.FC = () => {
  const { saleId } = useParams();
  const [data, setData] = useState<SaleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/shop/documents/sales/${saleId}/invoice`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch sale data for print', error);
      } finally {
        setLoading(false);
      }
    };
    if (saleId) {
      fetchData();
    }
  }, [saleId]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading invoice data...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Invoice not found.</div>;

  const columns: Column<SaleItem>[] = [
    { header: '#', accessor: (_row: SaleItem, idx?: number) => String((idx || 0) + 1), width: '5%' },
    { header: 'Item Code', accessor: (row: SaleItem) => row.productCode || row.productId || '-', width: '15%' },
    { header: 'Description', accessor: (row: SaleItem) => row.productName || row.itemName, width: '40%' },
    { header: 'Qty', accessor: (row: SaleItem) => String(row.quantity), width: '10%', align: 'right' },
    { header: 'Unit Price', accessor: (row: SaleItem) => Number(row.unitPrice).toFixed(2), width: '15%', align: 'right' },
    { header: 'Total', accessor: (row: SaleItem) => Number(row.totalPrice).toFixed(2), width: '15%', align: 'right' }
  ];

  const meta = [
    { label: 'Customer', value: data.customerName || 'Walk-in' },
    { label: 'Date', value: data.saleDate },
    { label: 'Cashier', value: data.createdBy }
  ];

  const rightMeta = [
    { label: 'Payment Method', value: data.paymentMethod },
    { label: 'Payment Status', value: data.paymentStatus }
  ];

  return (
    <PrintPageWrapper>
      <PrintActions />
      <PrintHeader 
        title="SALES INVOICE" 
        documentNumber={data.saleNumber} 
        meta={meta}
        rightMeta={rightMeta}
      />
      
      <PrintableTable 
        columns={columns} 
        data={data.items} 
        totalLabel="Grand Total"
        totalValue={data.totalAmount.toFixed(2)}
      />

      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <p>Thank you for shopping with Coop!</p>
      </div>
    </PrintPageWrapper>
  );
};
