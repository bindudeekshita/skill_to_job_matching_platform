package com.skillmatch.controller;

import com.skillmatch.dto.LoginRequest;
import com.skillmatch.dto.RegisterRequest;
import com.skillmatch.model.AppUser;
import com.skillmatch.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users; private final PasswordEncoder encoder;
    public AuthController(UserRepository users, PasswordEncoder encoder){this.users=users;this.encoder=encoder;}

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if(users.existsByEmailIgnoreCase(req.getEmail())) return ResponseEntity.status(409).body(Map.of("message","Email is already registered"));
        AppUser u = new AppUser(); u.setName(req.getName().trim()); u.setEmail(req.getEmail().trim().toLowerCase());
        u.setPasswordHash(encoder.encode(req.getPassword())); u.setRole(req.getRole());
        u.setEducation(req.getEducation()); u.setCompany(req.getCompany());
        return ResponseEntity.status(201).body(publicUser(users.save(u)));
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Optional<AppUser> found = users.findByEmailIgnoreCase(req.getEmail());
        if(found.isEmpty() || !encoder.matches(req.getPassword(), found.get().getPasswordHash()))
            return ResponseEntity.status(401).body(Map.of("message","Invalid email or password"));
        return ResponseEntity.ok(publicUser(found.get()));
    }
    static Map<String,Object> publicUser(AppUser u) {
        Map<String,Object> m=new LinkedHashMap<>(); m.put("id",u.getId());m.put("name",u.getName());
        m.put("email",u.getEmail());m.put("role",u.getRole());m.put("education",u.getEducation());
        m.put("company",u.getCompany());m.put("skills",u.getSkills());m.put("resumeUrl",u.getResumeUrl()); return m;
    }
}
