package com.foodexpress.controller;

import com.foodexpress.model.Category;
import com.foodexpress.model.MenuItem;
import com.foodexpress.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MenuItemController {

    private final MenuItemService menuItemService;

    @Autowired
    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return menuItemService.getAllCategories();
    }

    @GetMapping("/menu-items")
    public List<MenuItem> getMenuItems(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean vegOnly,
            @RequestParam(required = false) String search) {
        return menuItemService.searchMenuItems(categoryId, vegOnly, search);
    }

    @GetMapping("/menu-items/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        return menuItemService.getMenuItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/menu-items")
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody MenuItem item) {
        MenuItem created = menuItemService.saveMenuItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/menu-items/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem updated) {
        return menuItemService.getMenuItemById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setDescription(updated.getDescription());
            existing.setPrice(updated.getPrice());
            existing.setImageUrl(updated.getImageUrl());
            existing.setIsVegetarian(updated.getIsVegetarian());
            existing.setIsPopular(updated.getIsPopular());
            existing.setPrepTimeMinutes(updated.getPrepTimeMinutes());
            existing.setCalories(updated.getCalories());
            existing.setIsAvailable(updated.getIsAvailable());
            return ResponseEntity.ok(menuItemService.saveMenuItem(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/menu-items/{id}/availability")
    public ResponseEntity<MenuItem> toggleAvailability(@PathVariable Long id) {
        return menuItemService.toggleAvailability(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/menu-items/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
