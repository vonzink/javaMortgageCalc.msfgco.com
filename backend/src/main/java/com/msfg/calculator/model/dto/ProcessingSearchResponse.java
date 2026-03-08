package com.msfg.calculator.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessingSearchResponse {

    private List<ProcessingRecordDTO> results;
    private long total;
    private int page;
    private int perPage;
    private int totalPages;
}
