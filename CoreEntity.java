package com.example.flywaydemo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "core_entity")
public class CoreEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // getters & setters
}