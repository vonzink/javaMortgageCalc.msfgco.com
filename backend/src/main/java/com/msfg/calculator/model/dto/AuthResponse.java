package com.msfg.calculator.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {

    private String token;
    private String refreshToken;
    private UserDTO user;

    @Data
    @Builder
    public static class UserDTO {
        private Long id;
        private String email;
        private String name;
        private String initials;
        private String role;
    }
}
