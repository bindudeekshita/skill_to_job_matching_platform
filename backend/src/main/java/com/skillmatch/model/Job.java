package com.skillmatch.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="jobs")
public class Job {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String title;
    @Column(nullable=false, length=1200) private String description;
    private String company;
    private String location;
    private String jobType;
    private String eligibility;
    @Column(nullable=false, length=1000) private String requiredSkills;
    private Integer experienceYears = 0;
    private Long recruiterId;
    private LocalDateTime createdAt = LocalDateTime.now();
    private boolean active = true;

    public Job() {}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public String getCompany(){return company;} public void setCompany(String v){company=v;}
    public String getLocation(){return location;} public void setLocation(String v){location=v;}
    public String getJobType(){return jobType;} public void setJobType(String v){jobType=v;}
    public String getEligibility(){return eligibility;} public void setEligibility(String v){eligibility=v;}
    public String getRequiredSkills(){return requiredSkills;} public void setRequiredSkills(String v){requiredSkills=v;}
    public Integer getExperienceYears(){return experienceYears;} public void setExperienceYears(Integer v){experienceYears=v;}
    public Long getRecruiterId(){return recruiterId;} public void setRecruiterId(Long v){recruiterId=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}
