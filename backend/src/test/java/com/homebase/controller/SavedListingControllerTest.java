package com.homebase.controller;

import com.homebase.dto.ListingDto;
import com.homebase.dto.SavedListingDto;
import com.homebase.model.Listing;
import com.homebase.security.JwtUtil;
import com.homebase.service.SavedListingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.homebase.config.SecurityConfig;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SavedListingController.class)
@Import(SecurityConfig.class)
class SavedListingControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean SavedListingService savedListingService;
    @MockBean JwtUtil jwtUtil;
    @MockBean UserDetailsService userDetailsService;

    private SavedListingDto savedDto() {
        ListingDto listing = new ListingDto(1L, "Cozy 1BR in Annex", "Nice unit", "123 Main St",
                "Annex", new BigDecimal("1800"), 1, new BigDecimal("1.0"), 600,
                Listing.ListingType.RENTAL, null, null, "test", null, OffsetDateTime.now());
        return new SavedListingDto(10L, listing, OffsetDateTime.now());
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void getSaved_returnsListForUser() throws Exception {
        when(savedListingService.getSavedForUser("alice@example.com")).thenReturn(List.of(savedDto()));

        mockMvc.perform(get("/api/saved-listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].listing.title").value("Cozy 1BR in Annex"));
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void saveListing_returnsCreated() throws Exception {
        when(savedListingService.save("alice@example.com", 1L)).thenReturn(savedDto());

        mockMvc.perform(post("/api/saved-listings/1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.listing.id").value(1));
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void unsaveListing_returnsNoContent() throws Exception {
        doNothing().when(savedListingService).unsave("alice@example.com", 1L);

        mockMvc.perform(delete("/api/saved-listings/1"))
                .andExpect(status().isNoContent());

        verify(savedListingService).unsave(eq("alice@example.com"), eq(1L));
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void getSaved_emptyList_returnsEmptyArray() throws Exception {
        when(savedListingService.getSavedForUser("alice@example.com")).thenReturn(List.of());

        mockMvc.perform(get("/api/saved-listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getSaved_unauthenticated_returns403() throws Exception {
        mockMvc.perform(get("/api/saved-listings"))
                .andExpect(status().isForbidden());
    }
}
