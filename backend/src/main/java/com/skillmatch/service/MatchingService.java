package com.skillmatch.service;

import com.skillmatch.model.AppUser;
import com.skillmatch.model.Job;
import com.skillmatch.repository.JobRepository;
import com.skillmatch.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {
    private final UserRepository users;
    private final JobRepository jobs;
    public MatchingService(UserRepository users, JobRepository jobs){this.users=users;this.jobs=jobs;}

    public List<Map<String,Object>> matches(Long studentId) {
        AppUser student = users.findById(studentId).orElseThrow(() -> new NoSuchElementException("Student not found"));
        Set<String> studentSkills = tokens(student.getSkills());
        return jobs.findByActiveTrueOrderByCreatedAtDesc().stream().map(job -> {
            Set<String> required = tokens(job.getRequiredSkills());
            Set<String> matched = required.stream().filter(studentSkills::contains).collect(Collectors.toCollection(LinkedHashSet::new));
            List<String> missing = required.stream().filter(s -> !studentSkills.contains(s)).toList();
            int score = required.isEmpty() ? 0 : (int)Math.round(100.0 * matched.size() / required.size());
            Map<String,Object> row = new LinkedHashMap<>();
            row.put("job", job); row.put("matchPercentage", score);
            row.put("matchedSkills", matched); row.put("missingSkills", missing);
            return row;
        }).sorted(Comparator.<Map<String,Object>>comparingInt(m -> (Integer)m.get("matchPercentage")).reversed()).toList();
    }
    private Set<String> tokens(String raw) {
        if(raw == null || raw.isBlank()) return Set.of();
        return Arrays.stream(raw.split("[,;]")).map(String::trim).filter(s -> !s.isBlank())
                .map(String::toLowerCase).collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
