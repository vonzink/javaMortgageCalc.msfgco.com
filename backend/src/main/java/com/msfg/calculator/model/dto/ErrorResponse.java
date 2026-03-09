package com.msfg.calculator.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private int status;
    private String error;
    private String message;
    private String timestamp;
    private String path;

    private List<FieldViolation> violations;

    @Data
    @Builder
    public static class FieldViolation {
        private String field;
        private String message;
    }

    public static ErrorResponse of(int status, String error, String message, String path) {
        return ErrorResponse.builder()
                .status(status)
                .error(error)
                .message(message)
                .timestamp(Instant.now().toString())
                .path(path)
                .build();
    }
}

