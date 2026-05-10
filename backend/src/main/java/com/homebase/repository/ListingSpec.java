package com.homebase.repository;

import com.homebase.model.Listing;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class ListingSpec {

    private ListingSpec() {}

    public static Specification<Listing> withFilters(
            String neighbourhood,
            Listing.ListingType type,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minBedrooms) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (neighbourhood != null && !neighbourhood.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("neighbourhood")),
                        "%" + neighbourhood.toLowerCase() + "%"));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (minBedrooms != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bedrooms"), minBedrooms));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
