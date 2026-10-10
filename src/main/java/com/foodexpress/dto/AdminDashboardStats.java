package com.foodexpress.dto;

import com.foodexpress.model.MenuItem;
import java.util.List;

public class AdminDashboardStats {
    private Double totalRevenue;
    private Long totalOrders;
    private Long activeOrders;
    private Long deliveredOrders;
    private List<MenuItem> popularItems;

    public AdminDashboardStats() {}

    public AdminDashboardStats(Double totalRevenue, Long totalOrders, Long activeOrders, Long deliveredOrders, List<MenuItem> popularItems) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.activeOrders = activeOrders;
        this.deliveredOrders = deliveredOrders;
        this.popularItems = popularItems;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getActiveOrders() {
        return activeOrders;
    }

    public void setActiveOrders(Long activeOrders) {
        this.activeOrders = activeOrders;
    }

    public Long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(Long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }

    public List<MenuItem> getPopularItems() {
        return popularItems;
    }

    public void setPopularItems(List<MenuItem> popularItems) {
        this.popularItems = popularItems;
    }
}
