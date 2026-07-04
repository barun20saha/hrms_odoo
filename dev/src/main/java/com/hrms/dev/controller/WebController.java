package com.hrms.dev.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    // Add these two new routes:
    @GetMapping("/employee")
    public String employeeDashboard() {
        return "employee-dashboard";
    }

    @GetMapping("/admin")
    public String adminDashboard() {
        return "admin-dashboard";
    }
}