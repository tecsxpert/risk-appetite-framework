package com.campuspe.riskappetiteframework.repository;

import com.campuspe.riskappetiteframework.entity.Risk;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RiskRepository extends JpaRepository<Risk, Long> {

    List<Risk> findByCategory(String category);
    
    List<Risk> findByStatus(String status);

}