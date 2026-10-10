package com.foodexpress.model;

public enum OrderStatus {
    PLACED("Order Placed", "Your order has been received"),
    CONFIRMED("Confirmed", "Restaurant confirmed your order"),
    PREPARING("Preparing", "Chef is cooking your delicious food"),
    OUT_FOR_DELIVERY("Out for Delivery", "Delivery partner is on the way"),
    DELIVERED("Delivered", "Food delivered! Enjoy your meal!"),
    CANCELLED("Cancelled", "Order was cancelled");

    private final String displayName;
    private final String description;

    OrderStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
