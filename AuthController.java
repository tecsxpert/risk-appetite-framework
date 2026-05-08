package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.config.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository repo,
                          BCryptPasswordEncoder encoder,
                          JwtUtil jwtUtil) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    // ✅ REGISTER
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {

        // 🔴 Fix 1: check duplicate email
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        user.setRole("VIEWER");

        repo.save(user);

        Map<String, String> res = new HashMap<>();
        res.put("message", "User registered successfully");
        return res;
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User request) {

        User user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔴 Fix 2: password check
        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, String> res = new HashMap<>();
        res.put("token", token);

        return res;
    }

    // ✅ REFRESH
    @PostMapping("/refresh")
    public Map<String, String> refresh(@RequestHeader(value = "Authorization", required = false) String header) {

        // 🔴 Fix 3: null / invalid header check
        if (header == null || !header.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = header.substring(7); // remove "Bearer "

        String email = jwtUtil.extractEmail(token);

        String newToken = jwtUtil.generateToken(email);

        Map<String, String> res = new HashMap<>();
        res.put("token", newToken);

        return res;
    }
}