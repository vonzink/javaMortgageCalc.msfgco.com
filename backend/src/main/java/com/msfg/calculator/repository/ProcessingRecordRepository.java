package com.msfg.calculator.repository;

import com.msfg.calculator.model.entity.ProcessingRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessingRecordRepository extends JpaRepository<ProcessingRecord, Long> {

    Page<ProcessingRecord> findByType(String type, Pageable pageable);

    Page<ProcessingRecord> findByTypeAndStatus(String type, String status, Pageable pageable);

    @Query("SELECT r FROM ProcessingRecord r WHERE r.type = :type AND (" +
           "LOWER(r.borrower) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.loanNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.address) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.vendor) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.reference) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ProcessingRecord> searchByType(@Param("type") String type,
                                        @Param("query") String query,
                                        Pageable pageable);

    @Query("SELECT r FROM ProcessingRecord r WHERE r.type = :type AND r.status = :status AND (" +
           "LOWER(r.borrower) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.loanNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.address) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.vendor) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.reference) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ProcessingRecord> searchByTypeAndStatus(@Param("type") String type,
                                                  @Param("status") String status,
                                                  @Param("query") String query,
                                                  Pageable pageable);
}
