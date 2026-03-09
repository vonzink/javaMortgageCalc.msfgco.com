package com.msfg.calculator.service;

import com.msfg.calculator.exception.AuthenticationException;
import com.msfg.calculator.exception.DuplicateResourceException;
import com.msfg.calculator.exception.InvalidTokenException;
import com.msfg.calculator.model.dto.AuthResponse;
import com.msfg.calculator.model.dto.LoginRequest;
import com.msfg.calculator.model.dto.RegisterRequest;
import com.msfg.calculator.model.entity.RefreshToken;
import com.msfg.calculator.model.entity.User;
import com.msfg.calculator.repository.RefreshTokenRepository;
import com.msfg.calculator.repository.UserRepository;
import com.msfg.calculator.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtProvider jwtProvider;

    @InjectMocks private AuthService authService;

    @Captor ArgumentCaptor<User> userCaptor;
    @Captor ArgumentCaptor<RefreshToken> refreshTokenCaptor;

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("user@example.com");
        req.setPassword("password123");
        req.setFirstName("Jane");
        req.setLastName("Doe");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(req.getPassword())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });
        when(jwtProvider.getJwtRefreshExpirationMs()).thenReturn(60_000L);
        when(jwtProvider.generateToken(anyLong(), anyString(), anyString())).thenReturn("access");
        when(jwtProvider.generateRefreshToken(anyLong())).thenReturn("refresh");

        AuthResponse res = authService.register(req);

        assertThat(res.getToken()).isEqualTo("access");
        assertThat(res.getRefreshToken()).isEqualTo("refresh");
        assertThat(res.getUser().getEmail()).isEqualTo("user@example.com");

        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getInitials()).isEqualTo("JD");
        assertThat(userCaptor.getValue().getRole()).isEqualTo("user");

        verify(refreshTokenRepository).save(refreshTokenCaptor.capture());
        assertThat(refreshTokenCaptor.getValue().getToken()).isEqualTo("refresh");
    }

    @Test
    void register_duplicateEmail_throws409() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("user@example.com");
        req.setPassword("password123");
        req.setFirstName("Jane");
        req.setLastName("Doe");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already");
    }

    @Test
    void login_invalidEmail_throws401() {
        LoginRequest req = new LoginRequest();
        req.setEmail("nope@example.com");
        req.setPassword("password123");

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void login_invalidPassword_throws401() {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@example.com");
        req.setPassword("wrong");

        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .name("User")
                .role("user")
                .passwordHash("hashed")
                .build();

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(req.getPassword(), user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(AuthenticationException.class);
    }

    @Test
    void refresh_invalidJwt_throws401() {
        when(jwtProvider.validateToken("bad")).thenReturn(false);

        assertThatThrownBy(() -> authService.refreshToken("bad"))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void refresh_expiredStoredToken_throws401AndDeletes() {
        when(jwtProvider.validateToken("refresh")).thenReturn(true);

        RefreshToken stored = RefreshToken.builder()
                .id(1L)
                .token("refresh")
                .expiresAt(LocalDateTime.now().minusSeconds(1))
                .user(User.builder().id(1L).email("u@e.com").name("U").role("user").passwordHash("h").build())
                .build();

        when(refreshTokenRepository.findByToken("refresh")).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> authService.refreshToken("refresh"))
                .isInstanceOf(InvalidTokenException.class);

        verify(refreshTokenRepository).delete(stored);
    }
}

