package com.foodexpress.repository;

import com.foodexpress.model.Order;
import com.foodexpress.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.status <> 'CANCELLED'")
    Double calculateTotalRevenue();

    @Query("SELECT o FROM Order o WHERE o.status <> 'DELIVERED' AND o.status <> 'CANCELLED' ORDER BY o.createdAt ASC")
    List<Order> findActiveOrders();
}
