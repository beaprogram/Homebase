package com.homebase.dto;

import com.homebase.model.Listing;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ListingDto(
        Long id,
        String title,
        String description,
        String address,
        String neighbourhood,
        BigDecimal price,
        Integer bedrooms,
        BigDecimal bathrooms,
        Integer sqft,
        Listing.ListingType type,
        BigDecimal latitude,
        BigDecimal longitude,
        String source,
        String imageUrl,
        OffsetDateTime createdAt
) {}
