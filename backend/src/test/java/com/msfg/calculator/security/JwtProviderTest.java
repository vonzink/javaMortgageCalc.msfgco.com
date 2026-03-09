package com.msfg.calculator.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtProviderTest {

    @Test
    void generateToken_thenValidateAndExtractUserId() {
        JwtProvider jwtProvider = new JwtProvider(
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                60_000,
                120_000
        );

        String token = jwtProvider.generateToken(123L, "user@example.com", "user");

        assertThat(jwtProvider.validateToken(token)).isTrue();
        assertThat(jwtProvider.getUserIdFromToken(token)).isEqualTo(123L);
    }

    @Test
    void tokenExpires_thenValidateReturnsFalse() throws InterruptedException {
        JwtProvider jwtProvider = new JwtProvider(
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                1,
                120_000
        );

        String token = jwtProvider.generateToken(1L, "user@example.com", "user");
        Thread.sleep(5);

        assertThat(jwtProvider.validateToken(token)).isFalse();
    }
}

