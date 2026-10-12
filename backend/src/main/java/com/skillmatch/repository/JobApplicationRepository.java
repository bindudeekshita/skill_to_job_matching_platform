package com.skillmatch.repository;
import com.skillmatch.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByStudentIdOrderByAppliedAtDesc(Long studentId);
    List<JobApplication> findByJobIdInOrderByAppliedAtDesc(List<Long> jobIds);
    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);
}
