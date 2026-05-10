package com.homebase.dto;

import java.time.OffsetDateTime;

public record SavedListingDto(Long id, ListingDto listing, OffsetDateTime savedAt) {}
