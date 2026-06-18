import api from "./axios";

// ===== PAYMENT OPERATIONS =====

/**
 * Process a payment transaction.
 * Sends: { orderId, paymentMethod }
 * Backend reads amount directly from the Order entity.
 */
export const processPayment = async (paymentData) => {
  try {
    const res = await api.post("/payments", paymentData);
    return res.data;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

/**
 * Process card payment.
 * @param {Object} cardData  - Card details (number, name, expiry, cvv)
 * @param {Number} amount    - Payment amount (for display only; backend reads from Order)
 * @param {Number} orderId   - The order ID returned by createOrder()
 */
export const processCardPayment = async (cardData, amount, orderId) => {
  return processPayment({
    orderId,
    paymentMethod: 'CARD',
  });
};

/**
 * Process UPI / QR payment.
 * @param {Number} amount   - Payment amount (for display only; backend reads from Order)
 * @param {Number} orderId  - The order ID returned by createOrder()
 */
export const processQrPayment = async (amount, orderId) => {
  return processPayment({
    orderId,
    paymentMethod: 'UPI',
  });
};

/** Get all payments (Admin view) */
export const getAllPayments = async () => {
  try {
    const res = await api.get("/payments");
    return res.data;
  } catch (error) {
    console.error("Error fetching all payments:", error);
    throw error;
  }
};

/** Get payment by ID */
export const getPayment = async (paymentId) => {
  try {
    const res = await api.get(`/payments/${paymentId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching payment ${paymentId}:`, error);
    throw error;
  }
};

/** Get payments for a specific order */
export const getPaymentsByOrder = async (orderId) => {
  try {
    const res = await api.get(`/payments/order/${orderId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching payments for order ${orderId}:`, error);
    throw error;
  }
};

/** Get payment by transaction ID */
export const getPaymentByTransactionId = async (transactionId) => {
  try {
    const res = await api.get(`/payments/transaction/${transactionId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching payment with transaction ID ${transactionId}:`, error);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

export const formatPayment = (payment) => ({
  ...payment,
  timestamp: payment.paymentTime
    ? new Date(payment.paymentTime).toLocaleString('en-IN') : '',
  amountFormatted: `₹${payment.amount?.toFixed(2) || '0.00'}`,
});

export const getPaymentStatusColor = (status) => {
  const map = { SUCCESS: '#10b981', PENDING: '#f59e0b', FAILED: '#ef4444' };
  return map[status] || '#6b7280';
};

export const getPaymentMethodIcon = (method) => {
  const map = { CARD: '💳', UPI: '📱', CASH: '💵' };
  return map[method] || '💰';
};
