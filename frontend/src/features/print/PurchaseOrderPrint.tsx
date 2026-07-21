import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { PrintPageWrapper, PrintHeader, PrintActions, SignatureSection, PrintableTable } from '../../components/print';

interface POItem {
  id: number;
  itemName: string;
  quantity: number;
  orderedQuantity?: number;
  unitPrice: number;
  totalPrice: number;
  productCode?: string;
  productId?: string;
  productName?: string;
}

interface POData {
  id: number;
  poNumber: string;
  poDate: string;
  supplierName: string;
  totalAmount: number;
  items: POItem[];
  createdBy: string;
  status: string;
}

interface Column<T> {
  header: string;
  accessor: (row: T, idx?: number) => string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export const PurchaseOrderPrint: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<POData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/admin/print/purchase-orders/${id}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch PO data for print', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading PO data...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Purchase Order not found.</div>;

  const columns: Column<POItem>[] = [
    { header: '#', accessor: (_row: POItem, idx?: number) => String((idx || 0) + 1), width: '5%' },
    { header: 'Item Code', accessor: (row: POItem) => row.productCode || row.productId || '-', width: '15%' },
    { header: 'Product Description', accessor: (row: POItem) => row.productName || row.itemName, width: '30%' },
    { header: 'Qty', accessor: (row: POItem) => String(row.orderedQuantity || row.quantity), width: '10%', align: 'right' },
    { header: 'Unit Price', accessor: (row: POItem) => Number(row.unitPrice).toFixed(2), width: '15%', align: 'right' },
    { header: 'Total', accessor: (row: POItem) => Number(row.totalPrice).toFixed(2), width: '15%', align: 'right' }
  ];

  const meta = [
    { label: 'Supplier', value: data.supplierName },
    { label: 'Date', value: data.poDate },
    { label: 'Created By', value: data.createdBy }
  ];

  const rightMeta = [
    { label: 'Status', value: data.status }
  ];

  return (
    <PrintPageWrapper>
      <PrintActions />
      <PrintHeader 
        title="PURCHASE ORDER" 
        documentNumber={data.poNumber} 
        meta={meta}
        rightMeta={rightMeta}
      />
      
      <PrintableTable 
        columns={columns} 
        data={data.items} 
        totalLabel="Grand Total"
        totalValue={data.totalAmount?.toFixed(2)}
      />

      <SignatureSection signatures={['Prepared By', 'Authorized By', 'Supplier Acceptance']} />
    </PrintPageWrapper>
  );
};
