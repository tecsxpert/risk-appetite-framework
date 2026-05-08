package com.example.demo.serviceImpl;

import com.example.demo.entity.CoreEntity;
import com.example.demo.repository.CoreEntityRepository;
import com.example.demo.service.CoreEntityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CoreEntityServiceImpl implements CoreEntityService {

    private final CoreEntityRepository repository;

    @Override
    public CoreEntity update(Long id, CoreEntity updated) {

        CoreEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        entity.setName(updated.getName());
        entity.setEmail(updated.getEmail());
        entity.setPhone(updated.getPhone());
        entity.setStatus(updated.getStatus());

        return repository.save(entity);
    }

    @Override
    public String softDelete(Long id) {

        CoreEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        entity.setIsDeleted(true);
        repository.save(entity);

        return "Record soft deleted successfully";
    }

    @Override
    public List<CoreEntity> search(String q) {
        return repository.search(q);
    }

    @Override
    public Map<String, Object> getStats() {

        Map<String, Object> map = new HashMap<>();

        map.put("total", repository.count());
        map.put("active", repository.countByStatus("ACTIVE"));
        map.put("inactive", repository.countByStatus("INACTIVE"));
        map.put("deleted", repository.countByIsDeletedTrue());

        return map;
    }
}