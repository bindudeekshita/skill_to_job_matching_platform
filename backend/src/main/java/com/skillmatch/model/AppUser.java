package com.skillmatch.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="users")
public class AppUser {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=100) private String name;
    @Column(nullable=false, unique=true, length=160) private String email;
    @Column(nullable=false) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Role role;
    private String education;
    private String company;
    @Column(length=2000) private String skills;
    private String resumeUrl;
    private LocalDateTime createdAt = LocalDateTime.now();

    public AppUser() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
    public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String p){this.passwordHash=p;}
    public Role getRole(){return role;} public void setRole(Role r){this.role=r;}
    public String getEducation(){return education;} public void setEducation(String e){this.education=e;}
    public String getCompany(){return company;} public void setCompany(String c){this.company=c;}
    public String getSkills(){return skills;} public void setSkills(String s){this.skills=s;}
    public String getResumeUrl(){return resumeUrl;} public void setResumeUrl(String r){this.resumeUrl=r;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime d){this.createdAt=d;}
}
