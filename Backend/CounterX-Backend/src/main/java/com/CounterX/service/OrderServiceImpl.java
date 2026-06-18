package com.CounterX.service;

import com.CounterX.dto.OrderDto;
import com.CounterX.entity.Order;
import com.CounterX.entity.OrderItem;
import com.CounterX.entity.OrderStatus;
import com.CounterX.entity.OrderType;
import com.CounterX.entity.PaymentStatus;
import com.CounterX.exception.ResourceNotFoundException;
import com.CounterX.repository.OrderItemRepository;
import com.CounterX.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public Order placeOrder(OrderDto orderDTO) {

        Order order = new Order();

        order.setOrderDate(LocalDate.now());
        order.setOrderDateTime(LocalDateTime.now());

        // Use the helper that converts "Dine In" / "Take Away" -> enum
        OrderType resolvedType = orderDTO.resolvedOrderType();
        order.setOrderType(resolvedType);

        // totalAmount: frontend sends as "total"; @JsonAlias maps it correctly
        order.setTotalAmount(orderDTO.getTotalAmount());

        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setOrderStatus(OrderStatus.PENDING_PAYMENT);

        // Token number generated at payment time
        order.setDailyOrderNumber(0);

        Order savedOrder = orderRepository.save(order);

        // Persist cart items as OrderItem rows so Kitchen display,
        // Top Items, and Category Revenue all have real data to read.
        if (orderDTO.getItems() != null) {
            for (OrderDto.OrderItemInput input : orderDTO.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrderId(savedOrder.getOrderId());
                item.setItemName(input.getName());
                item.setQuantity(input.getQty() != null ? input.getQty() : 1);
                item.setPrice(input.getPrice() != null ? input.getPrice() : 0.0);
                // totalPrice is computed by @PrePersist on OrderItem
                orderItemRepository.save(item);
            }
        }

        return savedOrder;
    }

    @Override
    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order Not Found"));
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getTodayOrders() {
        return orderRepository.findByOrderDate(LocalDate.now());
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String orderStatus) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order Not Found"));

        // Map frontend status names to backend enum values.
        // Frontend uses: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
        // Backend enum:  PENDING_PAYMENT, PLACED, PREPARING, READY, SERVED, CANCELLED
        OrderStatus mapped = mapFrontendStatus(orderStatus);
        order.setOrderStatus(mapped);

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order updateOrderType(Long orderId, OrderType orderType) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order Not Found"));
        order.setOrderType(orderType);
        return orderRepository.save(order);
    }

    /**
     * Maps whatever the frontend sends into the backend enum.
     * Both the exact backend names and the frontend aliases are handled.
     */
    private OrderStatus mapFrontendStatus(String raw) {
        if (raw == null) throw new IllegalArgumentException("Status must not be null");
        switch (raw.trim().toUpperCase()) {
            case "PENDING":
            case "PENDING_PAYMENT": return OrderStatus.PENDING_PAYMENT;
            case "CONFIRMED":
            case "PLACED":         return OrderStatus.PLACED;
            case "PREPARING":      return OrderStatus.PREPARING;
            case "READY":          return OrderStatus.READY;
            case "COMPLETED":
            case "SERVED":         return OrderStatus.SERVED;
            case "CANCELLED":      return OrderStatus.CANCELLED;
            default:
                throw new IllegalArgumentException(
                        "Unknown order status: " + raw +
                        ". Valid values: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED");
        }
    }
}
