package com.homebase.controller;

import com.homebase.dto.ListingDto;
import com.homebase.model.Listing;
import com.homebase.service.ListingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ListingController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class})
class ListingControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean ListingService listingService;
    @MockBean com.homebase.security.JwtUtil jwtUtil;
    @MockBean org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    private ListingDto sampleDto() {
        return new ListingDto(1L, "Cozy 1BR in Annex", "Nice unit", "123 Main St",
                "Annex", new BigDecimal("1800"), 1, new BigDecimal("1.0"), 600,
                Listing.ListingType.RENTAL, new BigDecimal("43.6"), new BigDecimal("-79.4"),
                "test", null, OffsetDateTime.now());
    }

    @Test
    void getListings_returnsPage() throws Exception {
        when(listingService.search(any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(List.of(sampleDto())));

        mockMvc.perform(get("/api/listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Cozy 1BR in Annex"))
                .andExpect(jsonPath("$.content[0].neighbourhood").value("Annex"));
    }

    @Test
    void getListings_withFilters_passes() throws Exception {
        when(listingService.search(eq("Annex"), eq("RENTAL"), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(List.of(sampleDto())));

        mockMvc.perform(get("/api/listings?neighbourhood=Annex&type=RENTAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getListingById_found() throws Exception {
        when(listingService.getById(1L)).thenReturn(sampleDto());

        mockMvc.perform(get("/api/listings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("RENTAL"));
    }
}
