package com.CounterX.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TopItemDTO {

    private String itemName;

    // Exposed as both "quantity" and "salesCount" so the frontend
    // helper (item.salesCount || item.sales) gets a real value.
    private Integer quantity;

    // Revenue for this item (sum of totalPrice across all OrderItems)
    private Double revenue;

    public TopItemDTO() {
    }

    public TopItemDTO(String itemName, Integer quantity) {
        this.itemName = itemName;
        this.quantity = quantity;
    }

    public TopItemDTO(String itemName, Integer quantity, Double revenue) {
        this.itemName = itemName;
        this.quantity = quantity;
        this.revenue = revenue;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    // Alias so frontend "item.salesCount" resolves to the same value
    @JsonProperty("salesCount")
    public Integer getSalesCount() {
        return quantity;
    }

    public Double getRevenue() {
        return revenue;
    }

    public void setRevenue(Double revenue) {
        this.revenue = revenue;
    }
}
