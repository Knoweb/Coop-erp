package com.coop.erp.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class GrnRequest {

    @NotNull(message = "Supplier ID is required")
    private UUID supplierId;

    private String invoiceNumber;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    private String remarks;

    @Valid
    @NotEmpty(message = "At least one item is required")
    private List<GrnItemRequest> items;
}