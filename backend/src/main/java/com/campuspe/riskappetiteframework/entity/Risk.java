package com.campuspe.riskappetiteframework.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity                                                 //initialize for creating table
@Table(name = "risk")                                   //initializing name of the table
@Data                                           
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Risk {

    @Id                                                 //represents primary key 
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-increment
    private Long id;

    @Column(nullable = false)                           // column name = title and can't be null
    private String title;

    @Column(length = 1000)                              // column max-length is 1000
    private String description;

    @Column(nullable = false)                       
    private String category;

    @Column(nullable = false)
    private String status;                              // it shows open, In_Progress, Closed

    @Column(nullable = false)
    private Integer riskScore;                          

    @Column(nullable = false)
    private String owner;                           

    //Auditing Field
    //Created Time 

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    //Updated Time 
    @LastModifiedDate
    private LocalDateTime updatedAt;
}