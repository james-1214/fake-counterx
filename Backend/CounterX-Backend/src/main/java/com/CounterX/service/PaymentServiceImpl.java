package com.CounterX.service;

import com.CounterX.dto.BillDTO;
import com.CounterX.dto.PaymentDTO;
import com.CounterX.entity.Order;
import com.CounterX.entity.OrderStatus;
import com.CounterX.entity.Payment;
import com.CounterX.entity.PaymentStatus;
import com.CounterX.exception.ResourceNotFoundException;
import com.CounterX.repository.OrderRepository;
import com.CounterX.repository.PaymentRepository;
import com.CounterX.util.QRCodeGenerator;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    // GST rate used to back-calculate subTotal and gstAmount
    // Must match the rate applied on the frontend (CartContext: tax = subtotal * 0.05)
    private static final double GST_RATE = 0.05;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RevenueService revenueService;

    @Autowired
    private BillService billService;

    @Override
    @Transactional  // Rolls back cleanly if bill generation fails
    public Payment processPayment(PaymentDTO dto) {

        // Fetch order
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order Not Found"));

        // Guard against duplicate payment
        paymentRepository.findFirstByOrderId(dto.getOrderId())
                .ifPresent(p -> { throw new RuntimeException("Payment Already Completed"); });

        // Create Payment record
        Payment payment = new Payment();
        payment.setOrderId(order.getOrderId());
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8));
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentTime(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // Update order payment status and assign daily token number
        order.setPaymentStatus(PaymentStatus.SUCCESS);

        Order lastOrder = orderRepository
                .findTopByOrderDateOrderByDailyOrderNumberDesc(LocalDate.now());
        int nextToken = (lastOrder != null && lastOrder.getDailyOrderNumber() != null)
                ? lastOrder.getDailyOrderNumber() + 1
                : 1;
        order.setDailyOrderNumber(nextToken);
        order.setOrderStatus(OrderStatus.PLACED);
        orderRepository.save(order);

        // Update daily revenue tracker
        revenueService.updateDailyRevenue(savedPayment.getAmount());

        // ----------------------------------------------------------------
        // Build BillDTO — previously missing subTotal / gstAmount caused NPE
        // ----------------------------------------------------------------
        double totalAmount = order.getTotalAmount();
        // Back-calculate: total = subtotal * (1 + GST_RATE)
        double subTotal   = totalAmount / (1 + GST_RATE);
        double gstAmount  = totalAmount - subTotal;

        BillDTO billDTO = new BillDTO();
        billDTO.setOrderId(order.getOrderId());
        billDTO.setDailyOrderNumber(order.getDailyOrderNumber());
        billDTO.setOrderType(order.getOrderType());
        billDTO.setSubTotal(subTotal);                 // ← was never set before
        billDTO.setGstAmount(gstAmount);               // ← was never set before
        billDTO.setTotalAmount(totalAmount);
        billDTO.setPaymentStatus(PaymentStatus.SUCCESS);

        billService.generateBill(billDTO);

        return savedPayment;
    }

    @Override
    public Payment getPayment(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment Not Found"));
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public List<Payment> getPaymentsByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    @Override
    public Payment getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction Not Found"));
    }

    @Override
    public byte[] generateQr(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order Not Found"));

        String transactionId = "TXN-" + UUID.randomUUID();
        String upiUrl = QRCodeGenerator.generateUPIQRCode(
                "counterx@paytm", "CounterX", order.getTotalAmount(), transactionId);

        try {
            BitMatrix bitMatrix = new MultiFormatWriter()
                    .encode(upiUrl, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("QR Code Generation Failed");
        }
    }
}
