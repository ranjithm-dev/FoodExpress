package com.foodexpress.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    // Razorpay Test Mode Simulation or Live Credentials
    private final String razorpayKeyId = "rzp_test_FoodExpressDemo";

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<Map<String, Object>> createRazorpayOrder(@RequestBody Map<String, Object> payload) {
        Double amount = Double.parseDouble(payload.getOrDefault("amount", 0.0).toString());
        long amountInPaise = Math.round(amount * 100);

        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", "order_" + UUID.randomUUID().toString().substring(0, 14));
        response.put("currency", "INR");
        response.put("amount", amountInPaise);
        response.put("keyId", razorpayKeyId);
        response.put("status", "created");
        response.put("message", "Razorpay Test Order initialized successfully");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("paymentId", "pay_" + UUID.randomUUID().toString().substring(0, 14));
        response.put("message", "Payment verified successfully via Razorpay test mode");
        return ResponseEntity.ok(response);
    }
}
