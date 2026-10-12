package com.skillmatch.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="job_applications", uniqueConstraints=@UniqueConstraint(columnNames={"studentId","jobId"}))
public class JobApplication {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long studentId;
    @Column(nullable=false) private Long jobId;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ApplicationStatus status = ApplicationStatus.APPLIED;
    private LocalDateTime appliedAt = LocalDateTime.now();
    @Column(length=1000) private String coverNote;

    public JobApplication() {}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Long getStudentId(){return studentId;} public void setStudentId(Long v){studentId=v;}
    public Long getJobId(){return jobId;} public void setJobId(Long v){jobId=v;}
    public ApplicationStatus getStatus(){return status;} public void setStatus(ApplicationStatus v){status=v;}
    public LocalDateTime getAppliedAt(){return appliedAt;} public void setAppliedAt(LocalDateTime v){appliedAt=v;}
    public String getCoverNote(){return coverNote;} public void setCoverNote(String v){coverNote=v;}
}
