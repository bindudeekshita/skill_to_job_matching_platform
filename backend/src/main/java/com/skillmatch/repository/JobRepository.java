package com.skillmatch.repository;
import com.skillmatch.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByActiveTrueOrderByCreatedAtDesc();
    List<Job> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);
}
