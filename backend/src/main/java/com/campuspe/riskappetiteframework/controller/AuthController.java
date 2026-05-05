package com.campuspe.riskappetiteframework.controller;

import com.campuspe.riskappetiteframework.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");

        // simple dummy check
        if ("admin".equals(username) && "admin123".equals(password)) {
            String token = jwtUtil.generateToken(username);

            Map<String, String> response = new HashMap<>();
            response.put("token", token);

            return response;
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }
}