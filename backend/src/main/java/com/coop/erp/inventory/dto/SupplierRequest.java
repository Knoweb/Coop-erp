package com.coop.erp.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    private String name;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    private String address;
}