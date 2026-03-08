package com.msfg.calculator.service;

import com.msfg.calculator.exception.ResourceNotFoundException;
import com.msfg.calculator.model.dto.CreateProcessingRecordRequest;
import com.msfg.calculator.model.dto.ProcessingRecordDTO;
import com.msfg.calculator.model.dto.ProcessingSearchResponse;
import com.msfg.calculator.model.dto.UpdateProcessingRecordRequest;
import com.msfg.calculator.model.entity.ProcessingRecord;
import com.msfg.calculator.repository.ProcessingRecordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProcessingService {

    private static final Set<String> VALID_TYPES = Set.of(
            "title", "insurance", "voe", "taxes", "amc", "payoffs", "other"
    );

    private final ProcessingRecordRepository processingRecordRepository;

    public ProcessingService(ProcessingRecordRepository processingRecordRepository) {
        this.processingRecordRepository = processingRecordRepository;
    }

    public ProcessingSearchResponse searchRecords(String type, String query, String status,
                                                   String sort, int page, int limit) {
        validateType(type);

        Sort sortOrder = buildSort(sort);
        PageRequest pageRequest = PageRequest.of(page - 1, limit, sortOrder);

        Page<ProcessingRecord> resultPage;

        if (query != null && !query.isBlank() && status != null && !status.isBlank()) {
            resultPage = processingRecordRepository.searchByTypeAndStatus(type, status, query, pageRequest);
        } else if (query != null && !query.isBlank()) {
            resultPage = processingRecordRepository.searchByType(type, query, pageRequest);
        } else if (status != null && !status.isBlank()) {
            resultPage = processingRecordRepository.findByTypeAndStatus(type, status, pageRequest);
        } else {
            resultPage = processingRecordRepository.findByType(type, pageRequest);
        }

        List<ProcessingRecordDTO> results = resultPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ProcessingSearchResponse.builder()
                .results(results)
                .total(resultPage.getTotalElements())
                .page(page)
                .perPage(limit)
                .totalPages(resultPage.getTotalPages())
                .build();
    }

    public ProcessingRecordDTO getRecord(String type, Long id) {
        validateType(type);

        ProcessingRecord record = processingRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcessingRecord", id));

        if (!record.getType().equals(type)) {
            throw new ResourceNotFoundException("ProcessingRecord", id);
        }

        return toDTO(record);
    }

    @Transactional
    public ProcessingRecordDTO createRecord(String type, CreateProcessingRecordRequest request) {
        validateType(type);

        ProcessingRecord record = ProcessingRecord.builder()
                .type(type)
                .borrower(request.getBorrower())
                .loanNumber(request.getLoanNumber())
                .address(request.getAddress())
                .vendor(request.getVendor())
                .status(request.getStatus() != null ? request.getStatus() : "pending")
                .orderedDate(request.getOrderedDate())
                .reference(request.getReference())
                .notes(request.getNotes())
                .build();

        record = processingRecordRepository.save(record);

        return toDTO(record);
    }

    @Transactional
    public ProcessingRecordDTO updateRecord(String type, Long id, UpdateProcessingRecordRequest request) {
        validateType(type);

        ProcessingRecord record = processingRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcessingRecord", id));

        if (!record.getType().equals(type)) {
            throw new ResourceNotFoundException("ProcessingRecord", id);
        }

        if (request.getBorrower() != null) {
            record.setBorrower(request.getBorrower());
        }
        if (request.getLoanNumber() != null) {
            record.setLoanNumber(request.getLoanNumber());
        }
        if (request.getAddress() != null) {
            record.setAddress(request.getAddress());
        }
        if (request.getVendor() != null) {
            record.setVendor(request.getVendor());
        }
        if (request.getStatus() != null) {
            record.setStatus(request.getStatus());
        }
        if (request.getOrderedDate() != null) {
            record.setOrderedDate(request.getOrderedDate());
        }
        if (request.getReference() != null) {
            record.setReference(request.getReference());
        }
        if (request.getNotes() != null) {
            record.setNotes(request.getNotes());
        }

        record = processingRecordRepository.save(record);

        return toDTO(record);
    }

    @Transactional
    public void deleteRecord(String type, Long id) {
        validateType(type);

        ProcessingRecord record = processingRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcessingRecord", id));

        if (!record.getType().equals(type)) {
            throw new ResourceNotFoundException("ProcessingRecord", id);
        }

        processingRecordRepository.delete(record);
    }

    private void validateType(String type) {
        if (!VALID_TYPES.contains(type)) {
            throw new IllegalArgumentException("Invalid processing type: " + type);
        }
    }

    private Sort buildSort(String sort) {
        if (sort == null) {
            sort = "newest";
        }
        return switch (sort) {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "borrower" -> Sort.by(Sort.Direction.ASC, "borrower");
            case "status" -> Sort.by(Sort.Direction.ASC, "status");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private ProcessingRecordDTO toDTO(ProcessingRecord record) {
        return ProcessingRecordDTO.builder()
                .id(record.getId())
                .type(record.getType())
                .borrower(record.getBorrower())
                .loanNumber(record.getLoanNumber())
                .address(record.getAddress())
                .vendor(record.getVendor())
                .status(record.getStatus())
                .orderedDate(record.getOrderedDate())
                .reference(record.getReference())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
