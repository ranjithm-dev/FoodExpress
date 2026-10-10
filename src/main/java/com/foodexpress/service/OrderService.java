package com.foodexpress.service;

import com.foodexpress.dto.AdminDashboardStats;
import com.foodexpress.dto.CouponResponse;
import com.foodexpress.dto.OrderRequest;
import com.foodexpress.model.*;
import com.foodexpress.repository.CouponRepository;
import com.foodexpress.repository.MenuItemRepository;
import com.foodexpress.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final CouponRepository couponRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository, MenuItemRepository menuItemRepository, CouponRepository couponRepository) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.couponRepository = couponRepository;
    }

    @Transactional
    public Order placeOrder(OrderRequest request) {
        Order order = new Order();
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        order.setOrderNumber("FE-" + uniqueSuffix);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setSpecialInstructions(request.getSpecialInstructions());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
        order.setPaymentStatus("PAID");
        order.setStatus(OrderStatus.PLACED);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setEstimatedDeliveryMinutes(35);

        double subtotal = 0.0;

        if (request.getItems() != null) {
            for (OrderRequest.OrderItemDto itemDto : request.getItems()) {
                MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                        .orElseThrow(() -> new IllegalArgumentException("Menu item not found with id: " + itemDto.getMenuItemId()));
                
                int qty = (itemDto.getQuantity() != null && itemDto.getQuantity() > 0) ? itemDto.getQuantity() : 1;
                double itemPrice = menuItem.getPrice();
                subtotal += itemPrice * qty;

                OrderItem orderItem = new OrderItem();
                orderItem.setMenuItemId(menuItem.getId());
                orderItem.setMenuItemName(menuItem.getName());
                orderItem.setPrice(itemPrice);
                orderItem.setQuantity(qty);
                orderItem.setCustomizations(itemDto.getCustomizations());

                order.addOrderItem(orderItem);
            }
        }

        order.setSubtotal(Math.round(subtotal * 100.0) / 100.0);

        // Apply coupon if valid
        double discount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            CouponResponse couponRes = validateCoupon(request.getCouponCode().trim(), subtotal);
            if (couponRes.isValid()) {
                discount = couponRes.getDiscountAmount();
                order.setCouponCode(couponRes.getCode());
            }
        }
        order.setDiscount(Math.round(discount * 100.0) / 100.0);

        // Delivery fee: $3.99, or FREE if subtotal >= 35.0
        double deliveryFee = subtotal >= 35.0 || subtotal == 0 ? 0.0 : 3.99;
        order.setDeliveryFee(deliveryFee);

        // Tax: 5% on discounted subtotal
        double taxableAmount = Math.max(0.0, subtotal - discount);
        double tax = Math.round(taxableAmount * 0.05 * 100.0) / 100.0;
        order.setTax(tax);

        // Total
        double total = Math.max(0.0, taxableAmount + deliveryFee + tax);
        order.setTotalAmount(Math.round(total * 100.0) / 100.0);

        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Optional<Order> updateOrderStatus(Long orderId, OrderStatus newStatus) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            if (newStatus == OrderStatus.DELIVERED) {
                order.setEstimatedDeliveryMinutes(0);
            } else if (newStatus == OrderStatus.OUT_FOR_DELIVERY) {
                order.setEstimatedDeliveryMinutes(10);
            } else if (newStatus == OrderStatus.PREPARING) {
                order.setEstimatedDeliveryMinutes(25);
            }
            return orderRepository.save(order);
        });
    }

    public CouponResponse validateCoupon(String code, Double subtotal) {
        if (code == null || code.trim().isEmpty()) {
            return new CouponResponse(false, null, 0.0, "Coupon code is empty");
        }
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim());
        if (couponOpt.isEmpty()) {
            return new CouponResponse(false, code, 0.0, "Invalid or expired coupon code");
        }
        Coupon coupon = couponOpt.get();
        if (subtotal < coupon.getMinOrderAmount()) {
            return new CouponResponse(false, code, 0.0, 
                String.format("Minimum order amount of $%.2f required for coupon %s", coupon.getMinOrderAmount(), coupon.getCode()));
        }
        double discount = coupon.calculateDiscount(subtotal);
        return new CouponResponse(true, coupon.getCode(), Math.round(discount * 100.0) / 100.0, 
            String.format("Coupon %s applied! Saved $%.2f", coupon.getCode(), discount));
    }

    public AdminDashboardStats getAdminStats() {
        Double totalRevenue = orderRepository.calculateTotalRevenue();
        long totalOrders = orderRepository.count();
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long activeOrders = totalOrders - deliveredOrders - orderRepository.countByStatus(OrderStatus.CANCELLED);
        List<MenuItem> popularItems = menuItemRepository.findByIsPopularTrue();

        return new AdminDashboardStats(
                totalRevenue != null ? Math.round(totalRevenue * 100.0) / 100.0 : 0.0,
                totalOrders,
                Math.max(0, activeOrders),
                deliveredOrders,
                popularItems
        );
    }
}
