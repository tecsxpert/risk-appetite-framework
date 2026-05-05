package com.campuspe.riskappetiteframework.exception;

import org.springframework.http.HttpStatus;
import com.campuspe.riskappetiteframework.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
	        MethodArgumentNotValidException ex) {

	    Map<String, String> errors = new HashMap<>();

	    ex.getBindingResult().getFieldErrors().forEach(error ->
	            errors.put(error.getField(), error.getDefaultMessage())
	    );

	    return ResponseEntity.badRequest().body(
	            new ApiResponse<>(false, "Validation Failed", errors)
	    );
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiResponse<String>> handleNotFound(
	        ResourceNotFoundException ex) {

	    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
	            new ApiResponse<>(false, ex.getMessage(), null)
	    );
	}
}