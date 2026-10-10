package com.foodexpress.repository;

import com.foodexpress.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryId(Long categoryId);
    List<MenuItem> findByIsVegetarian(Boolean isVegetarian);
    List<MenuItem> findByIsPopularTrue();

    @Query("SELECT m FROM MenuItem m WHERE " +
           "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
           "(:vegOnly IS NULL OR m.isVegetarian = :vegOnly) AND " +
           "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<MenuItem> searchMenuItems(@Param("categoryId") Long categoryId, 
                                   @Param("vegOnly") Boolean vegOnly, 
                                   @Param("search") String search);
}
