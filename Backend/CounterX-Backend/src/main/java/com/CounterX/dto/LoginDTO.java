package com.CounterX.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class LoginDTO {

    // Frontend sends "email"; backend previously required "username".
    // @JsonAlias makes Jackson accept either key into this field.
    @NotBlank(message = "Username is required")
    @JsonAlias("email")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginDTO() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
