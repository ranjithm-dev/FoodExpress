package com.foodexpress.controller;

import com.foodexpress.dto.CouponResponse;
import com.foodexpress.dto.CouponValidationRequest;
import com.foodexpress.dto.OrderRequest;
import com.foodexpress.dto.OrderStatusUpdateRequest;
import com.foodexpress.model.Order;
import com.foodexpress.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody OrderRequest request) {
        Order placedOrder = orderService.placeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(placedOrder);
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/orders/track/{orderNumber}")
    public ResponseEntity<Order> getOrderByOrderNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByOrderNumber(orderNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequest request) {
        if (request.getStatus() == null) {
            return ResponseEntity.badRequest().build();
        }
        return orderService.updateOrderStatus(id, request.getStatus())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/coupons/validate")
    public ResponseEntity<CouponResponse> validateCoupon(@RequestBody CouponValidationRequest request) {
        double subtotal = request.getSubtotal() != null ? request.getSubtotal() : 0.0;
        CouponResponse response = orderService.validateCoupon(request.getCode(), subtotal);
        return ResponseEntity.ok(response);
    }
}
