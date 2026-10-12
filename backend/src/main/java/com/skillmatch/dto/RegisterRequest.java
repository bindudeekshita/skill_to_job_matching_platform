package com.skillmatch.dto;
import com.skillmatch.model.Role;
import jakarta.validation.constraints.*;
public class RegisterRequest {
    @NotBlank private String name;
    @Email @NotBlank private String email;
    @Size(min=8, message="Password must contain at least 8 characters") private String password;
    @NotNull private Role role;
    private String education;
    private String company;
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
    public Role getRole(){return role;} public void setRole(Role v){role=v;}
    public String getEducation(){return education;} public void setEducation(String v){education=v;}
    public String getCompany(){return company;} public void setCompany(String v){company=v;}
}
