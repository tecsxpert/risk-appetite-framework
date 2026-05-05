package com.campuspe.riskappetiteframework.repository;

import com.campuspe.riskappetiteframework.entity.Risk;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RiskRepository extends JpaRepository<Risk, Long> {
	
	Page<Risk> findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrStatusContainingIgnoreCase(
	        String title,
	        String category,
	        String status,
	        Pageable pageable
	);

    List<Risk> findByCategory(String category);
    
    List<Risk> findByStatus(String status);

}