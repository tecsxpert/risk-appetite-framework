package com.campuspe.riskappetiteframework.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiBaseUrl;

    public AiServiceClient() {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());
        this.restTemplate = new RestTemplate(factory);
    }

    // ─── PRIVATE HELPER ───────────────────────────────────────────

    private Map<String, Object> postRequest(String endpoint, Map<String, Object> body) {
        try {
            String url = aiBaseUrl + endpoint;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (Exception e) {
            System.err.println("AI Service call failed [" + endpoint + "]: " + e.getMessage());
            return null; // always return null on failure, never throw
        }
    }

    // ─── /ai/describe → expects "raw_data" ────────────────────────

    public String describe(String title, String description) {
        Map<String, Object> body = Map.of(
                "raw_data", title + " - " + description
        );
        Map<String, Object> response = postRequest("/ai/describe", body);
        if (response != null && response.containsKey("description")) {
            return response.get("description").toString();
        }
        return null;
    }

    // ─── /ai/recommend → expects "risk_context" ───────────────────

    public String recommend(String title, String description) {
        Map<String, Object> body = Map.of(
                "risk_context", title + " - " + description
        );
        Map<String, Object> response = postRequest("/ai/recommend", body);
        if (response != null && response.containsKey("recommendations")) {
            try {
                // Store recommendations list as string for DB
                return response.get("recommendations").toString();
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    // ─── /ai/generate-report → expects "raw_data" ─────────────────

    public Map<String, Object> generateReport(String title, String description) {
        Map<String, Object> body = Map.of(
                "raw_data", title + " - " + description
        );
        return postRequest("/ai/generate-report", body);
    }
}