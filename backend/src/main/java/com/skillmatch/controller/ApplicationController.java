package com.skillmatch.controller;

import com.skillmatch.model.*;
import com.skillmatch.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final JobApplicationRepository applications; private final JobRepository jobs; private final UserRepository users;
    public ApplicationController(JobApplicationRepository applications, JobRepository jobs, UserRepository users){
        this.applications=applications;this.jobs=jobs;this.users=users;
    }
    public static class ApplyRequest { public Long studentId; public Long jobId; public String coverNote; }
    @PostMapping public ResponseEntity<?> apply(@RequestBody ApplyRequest r) {
        if(r.studentId==null || r.jobId==null) return ResponseEntity.badRequest().body(Map.of("message","Student and job are required"));
        Optional<AppUser> student=users.findById(r.studentId);
        Optional<Job> job=jobs.findById(r.jobId);
        if(student.isEmpty() || student.get().getRole()!=Role.STUDENT || job.isEmpty() || !job.get().isActive())
            return ResponseEntity.badRequest().body(Map.of("message","Valid student and active job are required"));
        if(applications.existsByStudentIdAndJobId(r.studentId,r.jobId))
            return ResponseEntity.status(409).body(Map.of("message","You have already applied to this job"));
        JobApplication a=new JobApplication();a.setStudentId(r.studentId);a.setJobId(r.jobId);a.setCoverNote(r.coverNote);
        return ResponseEntity.status(201).body(applications.save(a));
    }
    @GetMapping("/student/{studentId}") public List<Map<String,Object>> studentApplications(@PathVariable Long studentId) {
        return applications.findByStudentIdOrderByAppliedAtDesc(studentId).stream().map(this::withJob).toList();
    }
    @GetMapping("/recruiter/{recruiterId}") public List<Map<String,Object>> recruiterApplications(@PathVariable Long recruiterId) {
        List<Long> ids=jobs.findByRecruiterIdOrderByCreatedAtDesc(recruiterId).stream().map(Job::getId).toList();
        if(ids.isEmpty()) return List.of();
        return applications.findByJobIdInOrderByAppliedAtDesc(ids).stream().map(this::withJob).toList();
    }
    @PatchMapping("/{id}/status") public ResponseEntity<?> updateStatus(@PathVariable Long id,@RequestBody Map<String,String> body) {
        Optional<JobApplication> found=applications.findById(id);
        if(found.isEmpty()) return ResponseEntity.notFound().build();
        try {
            found.get().setStatus(ApplicationStatus.valueOf(body.getOrDefault("status","").toUpperCase()));
            return ResponseEntity.ok(applications.save(found.get()));
        } catch(IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message","Status must be APPLIED, SHORTLISTED, INTERVIEW, SELECTED or REJECTED"));
        }
    }
    private Map<String,Object> withJob(JobApplication a) {
        Map<String,Object> m=new LinkedHashMap<>();m.put("application",a);
        jobs.findById(a.getJobId()).ifPresent(j -> m.put("job",j));
        users.findById(a.getStudentId()).ifPresent(u -> m.put("student",Map.of("id",u.getId(),"name",u.getName(),"email",u.getEmail(),"skills",Objects.toString(u.getSkills(),""))));
        return m;
    }
}
