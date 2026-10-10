package com.foodexpress.service;

import com.foodexpress.model.Category;
import com.foodexpress.model.MenuItem;
import com.foodexpress.repository.CategoryRepository;
import com.foodexpress.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public MenuItemService(MenuItemRepository menuItemRepository, CategoryRepository categoryRepository) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> searchMenuItems(Long categoryId, Boolean vegOnly, String search) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return menuItemRepository.searchMenuItems(categoryId, vegOnly, query);
    }

    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }

    public MenuItem saveMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    public Optional<MenuItem> toggleAvailability(Long id) {
        return menuItemRepository.findById(id).map(item -> {
            item.setIsAvailable(!Boolean.TRUE.equals(item.getIsAvailable()));
            return menuItemRepository.save(item);
        });
    }
}
