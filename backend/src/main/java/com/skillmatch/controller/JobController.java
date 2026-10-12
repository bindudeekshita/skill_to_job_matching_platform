package com.skillmatch.controller;

import com.skillmatch.model.*;
import com.skillmatch.repository.*;
import com.skillmatch.service.MatchingService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobRepository jobs; private final UserRepository users; private final MatchingService matching;
    public JobController(JobRepository jobs, UserRepository users, MatchingService matching){this.jobs=jobs;this.users=users;this.matching=matching;}

    @GetMapping public List<Job> all(){return jobs.findByActiveTrueOrderByCreatedAtDesc();}
    @GetMapping("/matches/{studentId}") public ResponseEntity<?> matches(@PathVariable Long studentId) {
        try { return ResponseEntity.ok(matching.matches(studentId)); }
        catch(NoSuchElementException e){return ResponseEntity.status(404).body(Map.of("message",e.getMessage()));}
    }
    public static class JobRequest {
        public String title; public String description; public String company; public String location;
        public String jobType; public String eligibility; public String requiredSkills; public Integer experienceYears;
        public Long recruiterId;
    }
    @PostMapping public ResponseEntity<?> create(@RequestBody JobRequest r) {
        if(r.title==null || r.title.isBlank() || r.requiredSkills==null || r.requiredSkills.isBlank() || r.recruiterId==null)
            return ResponseEntity.badRequest().body(Map.of("message","Title, required skills and recruiter are required"));
        Optional<AppUser> recruiter=users.findById(r.recruiterId);
        if(recruiter.isEmpty() || recruiter.get().getRole()!=Role.RECRUITER)
            return ResponseEntity.badRequest().body(Map.of("message","Valid recruiter account required"));
        Job j=new Job(); j.setTitle(r.title.trim()); j.setDescription(Objects.toString(r.description,""));
        j.setCompany(Objects.toString(r.company,recruiter.get().getCompany())); j.setLocation(r.location);
        j.setJobType(r.jobType); j.setEligibility(r.eligibility); j.setRequiredSkills(r.requiredSkills);
        j.setExperienceYears(r.experienceYears==null?0:r.experienceYears); j.setRecruiterId(r.recruiterId);
        return ResponseEntity.status(201).body(jobs.save(j));
    }
    @GetMapping("/recruiter/{recruiterId}") public List<Job> recruiterJobs(@PathVariable Long recruiterId) {
        return jobs.findByRecruiterIdOrderByCreatedAtDesc(recruiterId);
    }
}
