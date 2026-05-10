package com.homebase.service;

import com.homebase.dto.ListingDto;
import com.homebase.dto.SavedListingDto;
import com.homebase.model.Listing;
import com.homebase.model.SavedListing;
import com.homebase.model.User;
import com.homebase.repository.ListingRepository;
import com.homebase.repository.SavedListingRepository;
import com.homebase.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedListingService {

    private final SavedListingRepository savedListingRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ListingService listingService;

    @Transactional(readOnly = true)
    public List<SavedListingDto> getSavedForUser(String email) {
        User user = findUser(email);
        return savedListingRepository.findByUserIdWithListing(user.getId())
                .stream()
                .map(sl -> new SavedListingDto(
                        sl.getId(),
                        listingService.toDto(sl.getListing()),
                        sl.getCreatedAt()))
                .toList();
    }

    @Transactional
    public SavedListingDto save(String email, Long listingId) {
        User user = findUser(email);
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new EntityNotFoundException("Listing not found: " + listingId));

        if (savedListingRepository.existsByUserIdAndListingId(user.getId(), listingId)) {
            throw new IllegalStateException("Listing already saved");
        }

        SavedListing savedListing = SavedListing.builder()
                .user(user)
                .listing(listing)
                .build();

        savedListingRepository.save(savedListing);
        return new SavedListingDto(savedListing.getId(), listingService.toDto(listing), savedListing.getCreatedAt());
    }

    @Transactional
    public void unsave(String email, Long listingId) {
        User user = findUser(email);
        if (!savedListingRepository.existsByUserIdAndListingId(user.getId(), listingId)) {
            throw new EntityNotFoundException("Saved listing not found");
        }
        savedListingRepository.deleteByUserIdAndListingId(user.getId(), listingId);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
    }
}
