package com.internship.tool.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import java.time.Duration;
import java.util.Map;

@Service
public class AiServiceClient {

    private final RestTemplate restTemplate;
    private final String AI_BASE_URL = "http://localhost:5000";

    public AiServiceClient() {
        this.restTemplate = new RestTemplate();

        // Set timeout (10 seconds)
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());

        this.restTemplate.setRequestFactory(factory);
    }

    // ─────────────────────────────────────────────────────────────
    // GENERIC POST CALL METHOD
    // ─────────────────────────────────────────────────────────────
    private Map<String, Object> postRequest(String endpoint, Map<String, Object> body) {
        try {
            String url = AI_BASE_URL + endpoint;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            return response.getBody();

        } catch (ResourceAccessException e) {
            // Timeout or connection error
            System.out.println("AI Service timeout/error: " + e.getMessage());
            return null;

        } catch (Exception e) {
            // Any other error
            System.out.println("AI Service failed: " + e.getMessage());
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ENDPOINT METHODS
    // ─────────────────────────────────────────────────────────────

    public Map<String, Object> describe(Map<String, Object> input) {
        return postRequest("/describe", input);
    }

    public Map<String, Object> categorise(Map<String, Object> input) {
        return postRequest("/categorise", input);
    }

    public Map<String, Object> recommend(Map<String, Object> input) {
        return postRequest("/recommend", input);
    }

    public Map<String, Object> generateReport(Map<String, Object> input) {
        return postRequest("/generate-report", input);
    }

    public Map<String, Object> query(Map<String, Object> input) {
        return postRequest("/query", input);
    }
}