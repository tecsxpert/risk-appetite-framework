package com.example.demo.service;

import com.example.demo.entity.CoreEntity;

import java.util.List;
import java.util.Map;

public interface CoreEntityService {

    CoreEntity update(Long id, CoreEntity updated);

    String softDelete(Long id);

    List<CoreEntity> search(String q);

    Map<String, Object> getStats();
}