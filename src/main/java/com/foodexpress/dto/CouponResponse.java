package com.foodexpress.dto;

public class CouponResponse {
    private boolean valid;
    private String code;
    private Double discountAmount;
    private String message;

    public CouponResponse() {}

    public CouponResponse(boolean valid, String code, Double discountAmount, String message) {
        this.valid = valid;
        this.code = code;
        this.discountAmount = discountAmount;
        this.message = message;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(Double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
