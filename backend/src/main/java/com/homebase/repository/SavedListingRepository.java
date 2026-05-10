package com.homebase.repository;

import com.homebase.model.SavedListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SavedListingRepository extends JpaRepository<SavedListing, Long> {

    @Query("SELECT sl FROM SavedListing sl JOIN FETCH sl.listing WHERE sl.user.id = :userId ORDER BY sl.createdAt DESC")
    List<SavedListing> findByUserIdWithListing(@Param("userId") Long userId);

    Optional<SavedListing> findByUserIdAndListingId(Long userId, Long listingId);

    boolean existsByUserIdAndListingId(Long userId, Long listingId);

    void deleteByUserIdAndListingId(Long userId, Long listingId);
}
