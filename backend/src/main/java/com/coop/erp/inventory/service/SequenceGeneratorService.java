package com.coop.erp.inventory.service;

import com.coop.erp.inventory.entity.SequenceCounter;
import com.coop.erp.inventory.repository.SequenceCounterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SequenceGeneratorService {

    private final SequenceCounterRepository repository;

    @Transactional(propagation = Propagation.MANDATORY)
    public String generateSaleNumber(String shopCode, LocalDate date) {
        String scope = "SALE-" + shopCode;
        
        SequenceCounter counter = repository.findByScopeAndSequenceDateForUpdate(scope, date)
                .orElseGet(() -> {
                    SequenceCounter newCounter = SequenceCounter.builder()
                            .scope(scope)
                            .sequenceDate(date)
                            .nextValue(1L)
                            .build();
                    return repository.saveAndFlush(newCounter);
                });
        
        Long currentVal = counter.getNextValue();
        counter.setNextValue(currentVal + 1);
        repository.save(counter);
        
        // Format: SHOPCODE-YYYYMMDD-000001
        String dateStr = date.toString().replace("-", ""); // e.g. 20260716
        String sequenceStr = String.format("%06d", currentVal);
        return String.format("%s-%s-%s", shopCode, dateStr, sequenceStr);
    }
}
