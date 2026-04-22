package com.campuspe.riskappetiteframework;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class RiskAppetiteFrameworkApplication {

	public static void main(String[] args) {
		SpringApplication.run(RiskAppetiteFrameworkApplication.class, args);
	}

}
