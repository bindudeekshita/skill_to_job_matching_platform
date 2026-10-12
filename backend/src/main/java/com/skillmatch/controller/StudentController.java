package com.skillmatch.controller;

import com.skillmatch.model.AppUser;
import com.skillmatch.model.Role;
import com.skillmatch.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final UserRepository users;
    public StudentController(UserRepository users){this.users=users;}

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return users.findById(id).filter(u -> u.getRole()==Role.STUDENT)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(AuthController.publicUser(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    public static class ProfileUpdate {
        public String name; public String education; public String skills; public String resumeUrl;
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ProfileUpdate p) {
        Optional<AppUser> found=users.findById(id);
        if(found.isEmpty() || found.get().getRole()!=Role.STUDENT) return ResponseEntity.notFound().build();
        AppUser u=found.get();
        if(p.name!=null && !p.name.isBlank()) u.setName(p.name.trim());
        u.setEducation(p.education); u.setSkills(p.skills); u.setResumeUrl(p.resumeUrl);
        return ResponseEntity.ok(AuthController.publicUser(users.save(u)));
    }
}
