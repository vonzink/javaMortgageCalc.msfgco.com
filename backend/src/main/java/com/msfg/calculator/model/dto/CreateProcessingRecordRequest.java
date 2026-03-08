package com.msfg.calculator.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateProcessingRecordRequest {

    @NotBlank
    private String borrower;

    private String loanNumber;
    private String address;
    private String vendor;
    private String status;
    private String orderedDate;
    private String reference;
    private String notes;
}
