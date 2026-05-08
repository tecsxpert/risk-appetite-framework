package com.example.demo.service;

import com.example.demo.entity.User;
import org.springframework.data.domain.Page;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface UserService {

    User create(User user);

    List<User> getAll();

    User getById(Long id);

    User update(Long id, User user);

    void delete(Long id);

    User findByEmail(String email);

    Page<User> getAllUsers(int page, int size, String sortBy, String sortDir);
    ByteArrayInputStream exportUsersToCSV();
}