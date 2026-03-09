package com.msfg.calculator.controller;

import com.msfg.calculator.repository.UserRepository;
import com.msfg.calculator.security.JwtProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AIController.class)
@AutoConfigureMockMvc(addFilters = false)
class AIControllerWebMvcTest {

    @Autowired MockMvc mvc;

    @MockBean JwtProvider jwtProvider;
    @MockBean UserRepository userRepository;

    @Test
    void extract_returnsStubError() throws Exception {
        mvc.perform(post("/api/ai/extract"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("AI extraction not yet configured"));
    }
}

