package com.foodexpress.model;

import jakarta.persistence.*;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String discountType; // "PERCENTAGE" or "FIXED"

    @Column(nullable = false)
    private Double discountValue;

    private Double minOrderAmount = 0.0;

    private Double maxDiscount = 100.0;

    private String description;

    private Boolean isActive = true;

    public Coupon() {}

    public Coupon(String code, String discountType, Double discountValue, Double minOrderAmount, Double maxDiscount, String description) {
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.minOrderAmount = minOrderAmount;
        this.maxDiscount = maxDiscount;
        this.description = description;
        this.isActive = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public Double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(Double discountValue) {
        this.discountValue = discountValue;
    }

    public Double getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(Double minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public Double getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(Double maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public Double calculateDiscount(Double subtotal) {
        if (!Boolean.TRUE.equals(isActive) || subtotal < minOrderAmount) {
            return 0.0;
        }
        if ("PERCENTAGE".equalsIgnoreCase(discountType)) {
            double calculated = subtotal * (discountValue / 100.0);
            return (maxDiscount != null && calculated > maxDiscount) ? maxDiscount : calculated;
        } else if ("FIXED".equalsIgnoreCase(discountType)) {
            return Math.min(discountValue, subtotal);
        }
        return 0.0;
    }
}
