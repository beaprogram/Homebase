package com.homebase.service;

import com.homebase.dto.ListingDto;
import com.homebase.model.Listing;
import com.homebase.repository.ListingRepository;
import com.homebase.repository.ListingSpec;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ListingService {

    private final ListingRepository listingRepository;

    public Page<ListingDto> search(
            String neighbourhood,
            String type,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minBedrooms,
            int page,
            int size) {

        Listing.ListingType listingType = (type != null && !type.isBlank())
                ? Listing.ListingType.valueOf(type.toUpperCase())
                : null;

        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return listingRepository
                .findAll(ListingSpec.withFilters(neighbourhood, listingType, minPrice, maxPrice, minBedrooms), pageable)
                .map(this::toDto);
    }

    public ListingDto getById(Long id) {
        return listingRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Listing not found: " + id));
    }

    public ListingDto toDto(Listing l) {
        return new ListingDto(
                l.getId(),
                l.getTitle(),
                l.getDescription(),
                l.getAddress(),
                l.getNeighbourhood(),
                l.getPrice(),
                l.getBedrooms(),
                l.getBathrooms(),
                l.getSqft(),
                l.getType(),
                l.getLatitude(),
                l.getLongitude(),
                l.getSource(),
                l.getImageUrl(),
                l.getCreatedAt()
        );
    }
}
