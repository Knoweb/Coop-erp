package com.coop.erp.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sequence_counters", schema = "grocery", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"scope", "sequence_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SequenceCounter {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 100)
    private String scope;

    @Column(name = "sequence_date", nullable = false)
    private LocalDate sequenceDate;

    @Column(name = "next_value", nullable = false)
    @Builder.Default
    private Long nextValue = 1L;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
