package com.CounterX.dto;

import com.CounterX.entity.OrderType;
import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.List;

public class OrderDto {

    // Total Bill Amount — frontend sends as "total"
    @JsonAlias({"total", "totalAmount"})
    private Double totalAmount;

    // Subtotal before tax — frontend sends as "subtotal"
    private Double subtotal;

    // Tax amount — frontend sends as "tax"
    private Double tax;

    // DINE_IN / TAKE_AWAY
    // Frontend sends "type" as "Dine In" or "Take Away" (plain string)
    // We accept as String and convert in the service
    @JsonAlias({"type", "orderType"})
    private String orderType;

    // Payment method ("qr" or "card")
    private String paymentMethod;

    // Cart items from frontend: [{ name, qty, price }]
    private List<OrderItemInput> items;

    // Table identifier (e.g. "Table 5")
    private String table;

    public OrderDto() {
    }

    // ---- Getters & Setters ----

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getTax() {
        return tax;
    }

    public void setTax(Double tax) {
        this.tax = tax;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public List<OrderItemInput> getItems() {
        return items;
    }

    public void setItems(List<OrderItemInput> items) {
        this.items = items;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    /**
     * Converts the plain-text orderType from the frontend
     * ("Dine In" / "Take Away") into the backend enum value.
     * Falls back to DINE_IN if the value is unrecognised.
     */
    public OrderType resolvedOrderType() {
        if (orderType == null) return OrderType.DINE_IN;
        String normalized = orderType.trim().toUpperCase()
                .replace(" ", "_")
                .replace("-", "_");
        // "DINE_IN", "DINEIN", "DINE IN" -> DINE_IN
        // "TAKE_AWAY", "TAKEAWAY", "TAKE AWAY" -> TAKE_AWAY
        if (normalized.contains("TAKE") || normalized.contains("AWAY")) {
            return OrderType.TAKE_AWAY;
        }
        return OrderType.DINE_IN;
    }

    // ---- Inner class for cart items ----

    public static class OrderItemInput {
        private String name;
        private Integer qty;
        private Double price;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getQty() { return qty; }
        public void setQty(Integer qty) { this.qty = qty; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
    }
}
