package com.CounterX.dto;

import java.time.LocalDate;

public class DashboardDTO {

    // Used by weekly chart — frontend reads "revenueDate"
    private LocalDate revenueDate;

    private Integer totalOrders;

    private Double totalRevenue;

    // Previously missing — both dashboards read these
    private Integer pendingOrders;

    private Integer completedOrders;

    public DashboardDTO() {
    }

    public DashboardDTO(LocalDate revenueDate,
                        Integer totalOrders,
                        Double totalRevenue,
                        Integer pendingOrders,
                        Integer completedOrders) {
        this.revenueDate = revenueDate;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.pendingOrders = pendingOrders;
        this.completedOrders = completedOrders;
    }

    // Convenience constructor for weekly/monthly data (no pending/completed breakdown)
    public DashboardDTO(LocalDate revenueDate,
                        Integer totalOrders,
                        Double totalRevenue) {
        this(revenueDate, totalOrders, totalRevenue, 0, 0);
    }

    public LocalDate getRevenueDate() {
        return revenueDate;
    }

    public void setRevenueDate(LocalDate revenueDate) {
        this.revenueDate = revenueDate;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Integer getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(Integer pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public Integer getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(Integer completedOrders) {
        this.completedOrders = completedOrders;
    }
}
