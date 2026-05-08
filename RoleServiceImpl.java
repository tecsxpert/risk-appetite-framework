package com.example.demo.serviceImpl;

import com.example.demo.entity.Role;
import com.example.demo.repository.RoleRepository;
import com.example.demo.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repository;

    @Override
    public Role create(Role role) {
        return repository.save(role);
    }

    @Override
    public List<Role> getAll() {
        return repository.findAll();
    }

    @Override
    public Role getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    @Override
    public Role update(Long id, Role updated) {

        Role role = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setName(updated.getName());

        return repository.save(role);
    }

    @Override
    public void delete(Long id) {

        Role role = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        repository.delete(role);
    }
}