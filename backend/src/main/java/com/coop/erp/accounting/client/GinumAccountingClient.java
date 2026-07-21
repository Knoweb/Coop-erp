package com.coop.erp.accounting.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class GinumAccountingClient {

    private final RestTemplate restTemplate;

    @Value("${ginum.api.url:http://localhost:8081}")
    private String ginumApiUrl;

    @Value("${ginum.api.key:local-dev-coop-api-key-change-me}")
    private String apiKey;

    public void postToGinum(String jsonPayload) {
        String endpoint = ginumApiUrl + "/api/coop/postings";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-COOP-API-KEY", apiKey);

        HttpEntity<String> request = new HttpEntity<>(jsonPayload, headers);

        try {
            restTemplate.postForObject(endpoint, request, String.class);
            log.info("Successfully posted to Ginum Accounting: {}", endpoint);
        } catch (Exception e) {
            log.error("Failed to post to Ginum Accounting", e);
            throw new RuntimeException("Accounting integration failed: " + e.getMessage());
        }
    }
}
