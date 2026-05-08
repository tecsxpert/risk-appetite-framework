package com.example.demo.serviceImpl;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;

    private final RoleRepository roleRepository;


    @Override
    public User create(User user) {

        Role role = roleRepository.findByName("ROLE_VIEWER")
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setRoles(Set.of(role));

        return repository.save(user);
    }

    @Override
    public List<User> getAll() {
        return repository.findAll();
    }

    @Override
    public User getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User update(Long id, User updated) {

        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(updated.getUsername());
        user.setEmail(updated.getEmail());
        user.setPassword(updated.getPassword());
        user.setRoles(updated.getRoles());

        return repository.save(user);
    }

    @Override
    public void delete(Long id) {

        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        repository.delete(user);
    }

    @Override
    public User findByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    @Override
    public Page<User> getAllUsers(int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return repository.findAll(pageable);

        }

    @Override
    public ByteArrayInputStream exportUsersToCSV() {

        List<User> users = repository.findAll();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        // Header
        writer.println("ID,Name,Email");

        // Data
        for (User user : users) {
            writer.println(
                    user.getId() + "," +
                            user.getUsername() + "," +
                            user.getEmail()
            );
        }

        writer.flush();

        return new ByteArrayInputStream(out.toByteArray());
    }
}