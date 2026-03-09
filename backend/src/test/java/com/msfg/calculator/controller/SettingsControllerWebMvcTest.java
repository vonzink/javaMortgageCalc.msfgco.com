package com.msfg.calculator.controller;

import com.msfg.calculator.repository.UserRepository;
import com.msfg.calculator.security.JwtProvider;
import com.msfg.calculator.service.SettingsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SettingsController.class)
@AutoConfigureMockMvc(addFilters = false)
class SettingsControllerWebMvcTest {

    @Autowired MockMvc mvc;

    @MockBean SettingsService settingsService;
    @MockBean JwtProvider jwtProvider;
    @MockBean UserRepository userRepository;

    @Test
    void getSettings_returnsApiResponse() throws Exception {
        when(settingsService.getConfig()).thenReturn(Map.of("siteName", "Test"));

        mvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.siteName").value("Test"));
    }
}

