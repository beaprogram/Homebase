package com.homebase.service;

import com.homebase.dto.ListingDto;
import com.homebase.model.Listing;
import com.homebase.repository.ListingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {

    @Mock ListingRepository listingRepository;
    @InjectMocks ListingService listingService;

    private Listing sampleListing() {
        return Listing.builder()
                .id(1L)
                .title("Cozy 1BR in Annex")
                .neighbourhood("Annex")
                .price(new BigDecimal("1800"))
                .bedrooms(1)
                .type(Listing.ListingType.RENTAL)
                .source("test")
                .build();
    }

    @Test
    @SuppressWarnings("unchecked")
    void search_returnsPage() {
        Page<Listing> page = new PageImpl<>(List.of(sampleListing()));
        when(listingRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<ListingDto> result = listingService.search(null, null, null, null, null, 0, 20);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Cozy 1BR in Annex");
    }

    @Test
    @SuppressWarnings("unchecked")
    void search_withTypeFilter_passesSpecification() {
        Page<Listing> page = new PageImpl<>(List.of(sampleListing()));
        when(listingRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<ListingDto> result = listingService.search(null, "RENTAL", null, null, null, 0, 20);

        assertThat(result.getContent()).hasSize(1);
        verify(listingRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void getById_found() {
        when(listingRepository.findById(1L)).thenReturn(Optional.of(sampleListing()));

        ListingDto dto = listingService.getById(1L);

        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.neighbourhood()).isEqualTo("Annex");
    }

    @Test
    void getById_notFound_throws() {
        when(listingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> listingService.getById(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
