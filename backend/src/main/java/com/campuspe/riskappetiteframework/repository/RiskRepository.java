package com.campuspe.riskappetiteframework.repository;

import com.campuspe.riskappetiteframework.entity.Risk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Long> {
}