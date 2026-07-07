package com.coop.erp.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessProfileDto {
    private String businessName;
    private String registrationNumber;
    private String address;
    private String contactNumber;
    private String email;
    private String taxNumber;
    private String receiptFooterText;
}
