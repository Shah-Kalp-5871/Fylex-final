import api from './api';

export const getOrders = (params?: any) => api.get('/orders', { params });
export const getOrderById = (id: string | number) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id: string | number, status: string, notes?: string) => 
  api.put(`/orders/${id}/status`, { status, notes });
export const updateOrderPaymentStatus = (id: string | number, status: string, notes?: string) => 
  api.put(`/orders/${id}/payment-status`, { payment_status: status, notes });
export const updateOrderTracking = (id: string | number, data: any) => 
  api.post(`/orders/${id}/tracking`, data);
export const processOrderRefund = (id: string | number, data: any) => 
  api.post(`/orders/${id}/refund`, data);
export const downloadInvoice = async (id: string | number, download = false) => {
  try {
    const response = await api.get(`/orders/${id}/invoice?download=${download}`, {
      responseType: 'blob'
    });
    
    // api interceptor wraps the response
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data as any], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    if (download) {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-ORD-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } else {
      window.open(url, '_blank');
    }
    
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to download invoice' };
  }
};

const orderService = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderTracking,
  processOrderRefund,
  downloadInvoice,
};

export default orderService;
