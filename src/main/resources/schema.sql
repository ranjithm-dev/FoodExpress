-- ============================================================
-- FoodExpress - MySQL 8.0 Database Safe Setup Script
-- Database: food_ordering_db
-- Completely safe: Creates tables IF NOT EXISTS without dropping any database or tables.
-- ============================================================

CREATE DATABASE IF NOT EXISTS food_ordering_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE food_ordering_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    address VARCHAR(500),
    role VARCHAR(30) DEFAULT 'CUSTOMER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    display_order INT DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    category_id BIGINT,
    image_url VARCHAR(500),
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    prep_time_minutes INT DEFAULT 20,
    calories INT DEFAULT 450,
    rating DOUBLE DEFAULT 4.8,
    rating_count INT DEFAULT 100,
    is_available BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_menu_item_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DOUBLE NOT NULL,
    min_order_amount DOUBLE DEFAULT 0.0,
    max_discount DOUBLE DEFAULT 100.0,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address VARCHAR(1000) NOT NULL,
    special_instructions VARCHAR(500),
    payment_method VARCHAR(30) DEFAULT 'CARD',
    payment_status VARCHAR(30) DEFAULT 'PAID',
    status VARCHAR(30) NOT NULL DEFAULT 'PLACED',
    subtotal DOUBLE DEFAULT 0.0,
    discount DOUBLE DEFAULT 0.0,
    tax DOUBLE DEFAULT 0.0,
    delivery_fee DOUBLE DEFAULT 0.0,
    total_amount DOUBLE DEFAULT 0.0,
    coupon_code VARCHAR(50),
    estimated_delivery_minutes INT DEFAULT 35,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT,
    menu_item_name VARCHAR(200) NOT NULL,
    price DOUBLE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    customizations VARCHAR(255),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) 
        REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO users (name, email, password, phone, address, role) VALUES
('Alex Rivera', 'alex.rivera@example.com', 'password123', '+1 (555) 234-5678', '742 Evergreen Terrace, Apt 4B, Springfield', 'CUSTOMER'),
('Admin Chef', 'admin@foodexpress.com', 'admin123', '+1 (555) 000-1111', '100 Gourmet Way, Kitchen 1', 'ADMIN');

INSERT IGNORE INTO categories (id, name, icon, display_order) VALUES
(1, 'Gourmet Burgers', '🍔', 1),
(2, 'Artisan Pizzas', '🍕', 2),
(3, 'Asian Bowls & Noodles', '🍜', 3),
(4, 'Fresh Salads & Greens', '🥗', 4),
(5, 'Desserts & Shakes', '🍰', 5),
(6, 'Artisan Drinks', '🍹', 6);

INSERT IGNORE INTO menu_items (id, name, description, price, category_id, image_url, is_vegetarian, is_popular, prep_time_minutes, calories, rating, rating_count, is_available) VALUES
(1, 'The Truffle Smash Burger', 'Double smashed Angus beef patties, aged cheddar, caramelized shallots, black truffle garlic aioli on a toasted buttered brioche bun.', 15.99, 1, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', false, true, 18, 790, 4.9, 412, true),
(2, 'Crispy Avocado Portobello Burger', 'Panko-crusted whole portobello mushroom stuffed with smoked gouda, smashed Hass avocado, chipotle lime mayo, and wild baby arugula.', 13.49, 1, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80', true, false, 15, 620, 4.8, 195, true),
(3, 'Smoked BBQ Bacon Cheeseburger', 'Char-grilled beef patty, thick-cut applewood smoked bacon, crispy onion straws, sharp Wisconsin cheddar, and bourbon BBQ glaze.', 16.49, 1, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80', false, true, 20, 890, 4.9, 320, true),
(4, 'Wood-Fired Margherita D.O.P.', 'Hand-stretched sourdough crust, crushed San Marzano D.O.P. tomatoes, fresh buffalo mozzarella, fragrant basil leaves, and extra virgin olive oil.', 14.99, 2, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80', true, true, 18, 680, 4.9, 530, true),
(5, 'Hot Honey Pepperoni & Ricotta', 'Crispy cup-and-char pepperoni, creamy whole milk ricotta dollops, fresh mozzarella, organic chili-infused hot wildflower honey.', 17.99, 2, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80', false, true, 18, 860, 5.0, 640, true),
(6, 'Tuscan Truffle Mushroom Pizza', 'Creamy garlic bechamel, sautéed cremini & shiitake forest mushrooms, fontina cheese, white truffle oil, and freshly picked thyme.', 18.49, 2, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', true, false, 20, 740, 4.8, 210, true),
(7, 'Tokyo Tonkotsu Pork Ramen', 'Rich 16-hour simmered pork bone broth, tender slow-braised chashu pork belly, ajitsuke tamago ramen egg, nori sheet, menma, and spring onions.', 16.99, 3, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', false, true, 15, 750, 4.9, 480, true),
(8, 'Spicy Sichuan Dan Dan Noodles', 'Hand-pulled springy wheat noodles in fiery toasted sesame and Sichuan chili broth, savory minced pork, crushed roasted peanuts, and steamed bok col.', 14.49, 3, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80', false, false, 12, 640, 4.7, 180, true),
(9, 'Teriyaki Glazed Salmon & Grain Bowl', 'Crispy skin wild salmon fillet, warm tri-color quinoa, steamed edamame, pickled ginger ribbons, Hass avocado slices, and sesame glaze.', 18.99, 3, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', false, true, 15, 590, 4.9, 390, true),
(10, 'Mediterranean Falafel Mezze Bowl', 'Golden herb falafels, velvety roasted garlic hummus, cucumber kalamata salad, marinated cherry tomatoes, pickled onions, and creamy tahini.', 13.99, 4, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', true, false, 10, 520, 4.8, 240, true),
(11, 'Burrata & Grilled Peach Summer Salad', 'Imported Italian burrata ball, char-grilled ripe peaches, heirloom cherry tomatoes, baby wild arugula, candied pecans, and 12-year aged balsamic drizzle.', 14.49, 4, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', true, true, 10, 430, 4.9, 310, true),
(12, 'Molten Belgian Chocolate Lava Cake', 'Warm dark chocolate decadence cake with an oozing liquid ganache center, Madagascar vanilla bean gelato, and fresh raspberry coulis.', 9.99, 5, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', true, true, 12, 530, 4.9, 610, true),
(13, 'New York Strawberry Cheesecake', 'Velvety cream cheese filling on buttery graham cracker crust, topped with whole glazed organic strawberries and fresh mint.', 8.49, 5, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&q=80', true, false, 5, 480, 4.8, 290, true),
(14, 'Cold Brew Salted Caramel Frappe', '18-hour cold brew coffee blended with artisanal salted brown sugar caramel, creamy oat milk, and whipped vanilla mascarpone.', 6.49, 6, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80', true, true, 5, 290, 4.8, 380, true),
(15, 'Sparkling Dragonfruit Lychee Cooler', 'Muddled pink pitaya, fragrant lychee puree, sparkling mineral water, fresh mint, and lime wheels over crushed crystalline ice.', 5.99, 6, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', true, false, 5, 140, 4.7, 190, true);

INSERT IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, description, is_active) VALUES
('WELCOME50', 'PERCENTAGE', 50.0, 20.0, 15.0, '50% OFF up to $15 on orders above $20', true),
('FEAST20', 'PERCENTAGE', 20.0, 30.0, 20.0, '20% OFF up to $20 on orders above $30', true),
('FLAT10', 'FIXED', 10.0, 35.0, 10.0, 'Flat $10 OFF on orders above $35', true);

INSERT IGNORE INTO orders (id, order_number, customer_name, customer_email, customer_phone, delivery_address, special_instructions, payment_method, payment_status, status, subtotal, discount, tax, delivery_fee, total_amount, coupon_code, estimated_delivery_minutes, created_at) VALUES
(1, 'FE-88219', 'Alex Rivera', 'alex.rivera@example.com', '+1 (555) 234-5678', '742 Evergreen Terrace, Apt 4B, Springfield', 'Please ring the doorbell and leave at door', 'CARD', 'PAID', 'OUT_FOR_DELIVERY', 33.98, 0.0, 1.70, 3.99, 39.67, NULL, 10, NOW() - INTERVAL 22 MINUTE),
(2, 'FE-94102', 'Sophia Chen', 'sophia.chen@example.com', '+1 (555) 987-6543', '1088 Park Avenue, Suite 12, Manhattan', NULL, 'UPI', 'PAID', 'PREPARING', 31.48, 6.30, 1.26, 3.99, 30.43, 'FEAST20', 22, NOW() - INTERVAL 12 MINUTE),
(3, 'FE-63041', 'Marcus Vance', 'marcus.v@example.com', '+1 (555) 456-7890', '221B Baker Street, London', NULL, 'COD', 'PAID', 'DELIVERED', 41.47, 0.0, 2.07, 0.0, 43.54, NULL, 0, NOW() - INTERVAL 2 HOUR);

INSERT IGNORE INTO order_items (order_id, menu_item_id, menu_item_name, price, quantity, customizations) VALUES
(1, 1, 'The Truffle Smash Burger', 15.99, 1, 'Medium Rare, Extra Brioche'),
(1, 5, 'Hot Honey Pepperoni & Ricotta', 17.99, 1, 'Extra hot honey drizzle'),
(2, 7, 'Tokyo Tonkotsu Pork Ramen', 16.99, 1, 'Extra Tamago Egg'),
(2, 11, 'Burrata & Grilled Peach Summer Salad', 14.49, 1, 'Dressing on the side'),
(3, 3, 'Smoked BBQ Bacon Cheeseburger', 16.49, 1, 'Well done'),
(3, 6, 'Tuscan Truffle Mushroom Pizza', 18.49, 1, 'Crispy crust'),
(3, 14, 'Cold Brew Salted Caramel Frappe', 6.49, 1, 'Oat milk');
