package com.homebase.controller;

import com.homebase.dto.SavedListingDto;
import com.homebase.service.SavedListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-listings")
@RequiredArgsConstructor
@Tag(name = "Saved Listings")
@SecurityRequirement(name = "Bearer")
public class SavedListingController {

    private final SavedListingService savedListingService;

    @GetMapping
    @Operation(summary = "Get all saved listings for the authenticated user")
    public List<SavedListingDto> getSaved(@AuthenticationPrincipal UserDetails userDetails) {
        return savedListingService.getSavedForUser(userDetails.getUsername());
    }

    @PostMapping("/{listingId}")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Save a listing")
    public SavedListingDto save(@PathVariable Long listingId,
                                @AuthenticationPrincipal UserDetails userDetails) {
        return savedListingService.save(userDetails.getUsername(), listingId);
    }

    @DeleteMapping("/{listingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Unsave a listing")
    public void unsave(@PathVariable Long listingId,
                       @AuthenticationPrincipal UserDetails userDetails) {
        savedListingService.unsave(userDetails.getUsername(), listingId);
    }
}
