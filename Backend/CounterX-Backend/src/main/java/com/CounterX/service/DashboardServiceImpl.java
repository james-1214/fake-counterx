package com.CounterX.service;

import com.CounterX.dto.DashboardDTO;
import com.CounterX.entity.DailyRevenue;
import com.CounterX.entity.OrderStatus;
import com.CounterX.repository.DailyRevenueRepository;
import com.CounterX.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private DailyRevenueRepository dailyRevenueRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public DashboardDTO getTodayDashboard() {

        LocalDate today = LocalDate.now();
        DailyRevenue revenue = dailyRevenueRepository.findByRevenueDate(today);

        // Count pending and completed orders directly from the orders table
        // so the stat cards on Dashboard and AdminDashboard show real numbers.
        long pendingCount = orderRepository.findByOrderDate(today)
                .stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.PENDING_PAYMENT
                          || o.getOrderStatus() == OrderStatus.PLACED
                          || o.getOrderStatus() == OrderStatus.PREPARING
                          || o.getOrderStatus() == OrderStatus.READY)
                .count();

        long completedCount = orderRepository.findByOrderDate(today)
                .stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.SERVED)
                .count();

        if (revenue == null) {
            return new DashboardDTO(
                    today,
                    0,
                    0.0,
                    (int) pendingCount,
                    (int) completedCount
            );
        }

        return new DashboardDTO(
                revenue.getRevenueDate(),
                revenue.getTotalOrders(),
                revenue.getTotalRevenue(),
                (int) pendingCount,
                (int) completedCount
        );
    }

    @Override
    public List<DashboardDTO> getWeekDashboard() {

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        List<DailyRevenue> revenueList =
                dailyRevenueRepository.findByRevenueDateBetween(startDate, endDate);

        List<DashboardDTO> result = new ArrayList<>();

        for (DailyRevenue revenue : revenueList) {
            result.add(new DashboardDTO(
                    revenue.getRevenueDate(),
                    revenue.getTotalOrders(),
                    revenue.getTotalRevenue()
            ));
        }

        return result;
    }

    @Override
    public List<DashboardDTO> getMonthDashboard() {

        LocalDate today = LocalDate.now();
        List<DashboardDTO> result = new ArrayList<>();

        for (DailyRevenue revenue : dailyRevenueRepository.findAll()) {
            if (revenue.getRevenueDate().getMonthValue() == today.getMonthValue()
                    && revenue.getRevenueDate().getYear() == today.getYear()) {
                result.add(new DashboardDTO(
                        revenue.getRevenueDate(),
                        revenue.getTotalOrders(),
                        revenue.getTotalRevenue()
                ));
            }
        }

        return result;
    }
}
