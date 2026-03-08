package com.msfg.calculator.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessingRecordDTO {

    private Long id;
    private String type;
    private String borrower;
    private String loanNumber;
    private String address;
    private String vendor;
    private String status;
    private String orderedDate;
    private String reference;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
