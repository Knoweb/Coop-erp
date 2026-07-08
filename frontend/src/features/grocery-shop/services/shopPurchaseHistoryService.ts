import api from '../../../api/axiosConfig';

export interface PurchaseHistoryItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  lineTotal: number;
}

export interface PurchaseHistoryResponse {
  id: string;
  saleNumber: string;
  saleType: string;
  targetShopName: string | null;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  notes: string | null;
  saleDate: string;
  createdBy: string;
  sourceName: string;
  status: string;
  itemsCount: number;
  totalQuantity: number;
  items: PurchaseHistoryItem[];
}

export interface PurchaseHistoryFilters {
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export const getShopPurchaseHistory = async (filters?: PurchaseHistoryFilters): Promise<PurchaseHistoryResponse[]> => {
  const response = await api.get('/shop/purchase-history', { params: filters });
  return response.data;
};

export const getShopPurchaseHistoryById = async (id: string): Promise<PurchaseHistoryResponse> => {
  const response = await api.get(`/shop/purchase-history/${id}`);
  return response.data;
};
