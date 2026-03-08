package com.msfg.calculator.model.dto;

import lombok.Data;

@Data
public class UpdateProcessingRecordRequest {

    private String borrower;
    private String loanNumber;
    private String address;
    private String vendor;
    private String status;
    private String orderedDate;
    private String reference;
    private String notes;
}
