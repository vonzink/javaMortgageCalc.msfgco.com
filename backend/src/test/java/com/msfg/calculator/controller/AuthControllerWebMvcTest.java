package com.msfg.calculator.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.msfg.calculator.exception.AuthenticationException;
import com.msfg.calculator.model.dto.AuthResponse;
import com.msfg.calculator.repository.UserRepository;
import com.msfg.calculator.security.JwtProvider;
import com.msfg.calculator.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerWebMvcTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AuthService authService;
    @MockBean JwtProvider jwtProvider;
    @MockBean UserRepository userRepository;

    @Test
    void login_invalidCredentials_returns401ErrorResponse() throws Exception {
        when(authService.login(any())).thenThrow(new AuthenticationException("Invalid email or password"));

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\",\"password\":\"bad\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

    @Test
    void login_success_returnsApiResponseShape() throws Exception {
        AuthResponse response = AuthResponse.builder()
                .token("t")
                .refreshToken("r")
                .user(AuthResponse.UserDTO.builder().id(1L).email("u@e.com").name("U").initials("U").role("user").build())
                .build();

        when(authService.login(any())).thenReturn(response);

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("t"))
                .andExpect(jsonPath("$.data.refreshToken").value("r"));
    }
}

