package com.homebase.controller;

import com.homebase.dto.ListingDto;
import com.homebase.service.ListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@Tag(name = "Listings")
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    @Operation(summary = "Search listings with filters")
    public Page<ListingDto> search(
            @RequestParam(required = false) String neighbourhood,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minBedrooms,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return listingService.search(neighbourhood, type, minPrice, maxPrice, minBedrooms, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a listing by ID")
    public ListingDto getById(@PathVariable Long id) {
        return listingService.getById(id);
    }
}
