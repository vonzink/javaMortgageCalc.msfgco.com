package com.msfg.calculator.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "processing_records")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProcessingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String borrower;

    @Column(name = "loan_number")
    private String loanNumber;

    private String address;

    private String vendor;

    @Column(nullable = false)
    private String status;

    @Column(name = "ordered_date")
    private String orderedDate;

    private String reference;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
