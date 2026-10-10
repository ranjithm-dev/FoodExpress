package com.foodexpress.config;

import com.foodexpress.model.*;
import com.foodexpress.repository.CategoryRepository;
import com.foodexpress.repository.CouponRepository;
import com.foodexpress.repository.MenuItemRepository;
import com.foodexpress.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final com.foodexpress.repository.UserRepository userRepository;

    public DataLoader(CategoryRepository categoryRepository,
                      MenuItemRepository menuItemRepository,
                      CouponRepository couponRepository,
                      OrderRepository orderRepository,
                      com.foodexpress.repository.UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(new User("Alex Rivera", "alex.rivera@example.com", "password123", "+1 (555) 234-5678", "742 Evergreen Terrace, Apt 4B, Springfield", "CUSTOMER"));
            userRepository.save(new User("Admin Chef", "admin@foodexpress.com", "admin123", "+1 (555) 000-1111", "100 Gourmet Way, Kitchen 1", "ADMIN"));
        }

        if (categoryRepository.count() > 0) {
            return;
        }

        // 1. Categories
        Category burgers = categoryRepository.save(new Category("Gourmet Burgers", "🍔", 1));
        Category pizzas = categoryRepository.save(new Category("Artisan Pizzas", "🍕", 2));
        Category bowls = categoryRepository.save(new Category("Asian Bowls & Noodles", "🍜", 3));
        Category salads = categoryRepository.save(new Category("Fresh Salads & Greens", "🥗", 4));
        Category desserts = categoryRepository.save(new Category("Desserts & Shakes", "🍰", 5));
        Category drinks = categoryRepository.save(new Category("Artisan Drinks", "🍹", 6));

        // 2. Menu Items
        menuItemRepository.saveAll(List.of(
            // Burgers
            new MenuItem(
                "The Truffle Smash Burger",
                "Double smashed Angus beef patties, aged cheddar, caramelized shallots, black truffle garlic aioli on a toasted buttered brioche bun.",
                15.99, burgers,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
                false, true, 18, 790, 4.9, 412
            ),
            new MenuItem(
                "Crispy Avocado Portobello Burger",
                "Panko-crusted whole portobello mushroom stuffed with smoked gouda, smashed Hass avocado, chipotle lime mayo, and wild baby arugula.",
                13.49, burgers,
                "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80",
                true, false, 15, 620, 4.8, 195
            ),
            new MenuItem(
                "Smoked BBQ Bacon Cheeseburger",
                "Char-grilled beef patty, thick-cut applewood smoked bacon, crispy onion straws, sharp Wisconsin cheddar, and bourbon BBQ glaze.",
                16.49, burgers,
                "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80",
                false, true, 20, 890, 4.9, 320
            ),

            // Pizzas
            new MenuItem(
                "Wood-Fired Margherita D.O.P.",
                "Hand-stretched sourdough crust, crushed San Marzano D.O.P. tomatoes, fresh buffalo mozzarella, fragrant basil leaves, and extra virgin olive oil.",
                14.99, pizzas,
                "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
                true, true, 18, 680, 4.9, 530
            ),
            new MenuItem(
                "Hot Honey Pepperoni & Ricotta",
                "Crispy cup-and-char pepperoni, creamy whole milk ricotta dollops, fresh mozzarella, organic chili-infused hot wildflower honey.",
                17.99, pizzas,
                "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
                false, true, 18, 860, 5.0, 640
            ),
            new MenuItem(
                "Tuscan Truffle Mushroom Pizza",
                "Creamy garlic bechamel, sautéed cremini & shiitake forest mushrooms, fontina cheese, white truffle oil, and freshly picked thyme.",
                18.49, pizzas,
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
                true, false, 20, 740, 4.8, 210
            ),

            // Bowls & Noodles
            new MenuItem(
                "Tokyo Tonkotsu Pork Ramen",
                "Rich 16-hour simmered pork bone broth, tender slow-braised chashu pork belly, ajitsuke tamago ramen egg, nori sheet, menma, and spring onions.",
                16.99, bowls,
                "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
                false, true, 15, 750, 4.9, 480
            ),
            new MenuItem(
                "Spicy Sichuan Dan Dan Noodles",
                "Hand-pulled springy wheat noodles in fiery toasted sesame and Sichuan chili broth, savory minced pork, crushed roasted peanuts, and steamed bok choy.",
                14.49, bowls,
                "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
                false, false, 12, 640, 4.7, 180
            ),
            new MenuItem(
                "Teriyaki Glazed Salmon & Grain Bowl",
                "Crispy skin wild salmon fillet, warm tri-color quinoa, steamed edamame, pickled ginger ribbons, Hass avocado slices, and sesame glaze.",
                18.99, bowls,
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                false, true, 15, 590, 4.9, 390
            ),

            // Salads
            new MenuItem(
                "Mediterranean Falafel Mezze Bowl",
                "Golden herb falafels, velvety roasted garlic hummus, cucumber kalamata salad, marinated cherry tomatoes, pickled onions, and creamy tahini.",
                13.99, salads,
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
                true, false, 10, 520, 4.8, 240
            ),
            new MenuItem(
                "Burrata & Grilled Peach Summer Salad",
                "Imported Italian burrata ball, char-grilled ripe peaches, heirloom cherry tomatoes, baby wild arugula, candied pecans, and 12-year aged balsamic drizzle.",
                14.49, salads,
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
                true, true, 10, 430, 4.9, 310
            ),

            // Desserts
            new MenuItem(
                "Molten Belgian Chocolate Lava Cake",
                "Warm dark chocolate decadence cake with an oozing liquid ganache center, Madagascar vanilla bean gelato, and fresh raspberry coulis.",
                9.99, desserts,
                "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
                true, true, 12, 530, 4.9, 610
            ),
            new MenuItem(
                "New York Strawberry Cheesecake",
                "Velvety cream cheese filling on buttery graham cracker crust, topped with whole glazed organic strawberries and fresh mint.",
                8.49, desserts,
                "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&q=80",
                true, false, 5, 480, 4.8, 290
            ),

            // Drinks
            new MenuItem(
                "Cold Brew Salted Caramel Frappe",
                "18-hour cold brew coffee blended with artisanal salted brown sugar caramel, creamy oat milk, and whipped vanilla mascarpone.",
                6.49, drinks,
                "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
                true, true, 5, 290, 4.8, 380
            ),
            new MenuItem(
                "Sparkling Dragonfruit Lychee Cooler",
                "Muddled pink pitaya, fragrant lychee puree, sparkling mineral water, fresh mint, and lime wheels over crushed crystalline ice.",
                5.99, drinks,
                "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
                true, false, 5, 140, 4.7, 190
            )
        ));

        // 3. Coupons
        couponRepository.saveAll(List.of(
            new Coupon("WELCOME50", "PERCENTAGE", 50.0, 20.0, 15.0, "50% OFF up to $15 on orders above $20"),
            new Coupon("FEAST20", "PERCENTAGE", 20.0, 30.0, 20.0, "20% OFF up to $20 on orders above $30"),
            new Coupon("FLAT10", "FIXED", 10.0, 35.0, 10.0, "Flat $10 OFF on orders above $35")
        ));

        // 4. Initial Sample Orders for live dashboard
        Order sampleOrder1 = new Order();
        sampleOrder1.setOrderNumber("FE-88219");
        sampleOrder1.setCustomerName("Alex Rivera");
        sampleOrder1.setCustomerEmail("alex.rivera@example.com");
        sampleOrder1.setCustomerPhone("+1 (555) 234-5678");
        sampleOrder1.setDeliveryAddress("742 Evergreen Terrace, Apt 4B, Springfield");
        sampleOrder1.setSpecialInstructions("Please ring the doorbell and leave at door");
        sampleOrder1.setPaymentMethod("CARD");
        sampleOrder1.setPaymentStatus("PAID");
        sampleOrder1.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        sampleOrder1.setCreatedAt(LocalDateTime.now().minusMinutes(22));
        sampleOrder1.setEstimatedDeliveryMinutes(10);
        sampleOrder1.setSubtotal(33.98);
        sampleOrder1.setDiscount(0.0);
        sampleOrder1.setDeliveryFee(3.99);
        sampleOrder1.setTax(1.70);
        sampleOrder1.setTotalAmount(39.67);
        sampleOrder1.addOrderItem(new OrderItem(1L, "The Truffle Smash Burger", 15.99, 1, "Medium Rare, Extra Brioche"));
        sampleOrder1.addOrderItem(new OrderItem(5L, "Hot Honey Pepperoni & Ricotta", 17.99, 1, "Extra hot honey drizzle"));
        orderRepository.save(sampleOrder1);

        Order sampleOrder2 = new Order();
        sampleOrder2.setOrderNumber("FE-94102");
        sampleOrder2.setCustomerName("Sophia Chen");
        sampleOrder2.setCustomerEmail("sophia.chen@example.com");
        sampleOrder2.setCustomerPhone("+1 (555) 987-6543");
        sampleOrder2.setDeliveryAddress("1088 Park Avenue, Suite 12, Manhattan");
        sampleOrder2.setPaymentMethod("UPI");
        sampleOrder2.setPaymentStatus("PAID");
        sampleOrder2.setStatus(OrderStatus.PREPARING);
        sampleOrder2.setCreatedAt(LocalDateTime.now().minusMinutes(12));
        sampleOrder2.setEstimatedDeliveryMinutes(22);
        sampleOrder2.setSubtotal(31.48);
        sampleOrder2.setDiscount(6.30);
        sampleOrder2.setCouponCode("FEAST20");
        sampleOrder2.setDeliveryFee(3.99);
        sampleOrder2.setTax(1.26);
        sampleOrder2.setTotalAmount(30.43);
        sampleOrder2.addOrderItem(new OrderItem(7L, "Tokyo Tonkotsu Pork Ramen", 16.99, 1, "Extra Tamago Egg"));
        sampleOrder2.addOrderItem(new OrderItem(11L, "Burrata & Grilled Peach Summer Salad", 14.49, 1, "Dressing on the side"));
        orderRepository.save(sampleOrder2);

        Order sampleOrder3 = new Order();
        sampleOrder3.setOrderNumber("FE-63041");
        sampleOrder3.setCustomerName("Marcus Vance");
        sampleOrder3.setCustomerEmail("marcus.v@example.com");
        sampleOrder3.setCustomerPhone("+1 (555) 456-7890");
        sampleOrder3.setDeliveryAddress("221B Baker Street, London");
        sampleOrder3.setPaymentMethod("CARD");
        sampleOrder3.setPaymentStatus("PAID");
        sampleOrder3.setStatus(OrderStatus.DELIVERED);
        sampleOrder3.setCreatedAt(LocalDateTime.now().minusHours(2));
        sampleOrder3.setEstimatedDeliveryMinutes(0);
        sampleOrder3.setSubtotal(41.47);
        sampleOrder3.setDiscount(0.0);
        sampleOrder3.setDeliveryFee(0.0);
        sampleOrder3.setTax(2.07);
        sampleOrder3.setTotalAmount(43.54);
        sampleOrder3.addOrderItem(new OrderItem(3L, "Smoked BBQ Bacon Cheeseburger", 16.49, 1, "Well done"));
        sampleOrder3.addOrderItem(new OrderItem(6L, "Tuscan Truffle Mushroom Pizza", 18.49, 1, "Crispy crust"));
        sampleOrder3.addOrderItem(new OrderItem(14L, "Cold Brew Salted Caramel Frappe", 6.49, 1, "Oat milk"));
        orderRepository.save(sampleOrder3);
    }
}
