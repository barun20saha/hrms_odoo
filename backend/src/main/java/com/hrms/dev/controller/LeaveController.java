package com.hrms.dev.controller;

import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.LeaveActionRequest;
import com.hrms.dev.dto.LeaveApplyRequest;
import com.hrms.dev.dto.LeaveResponse;
import com.hrms.dev.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Leave Management", description = "Endpoints for employee leave applications and admin approval workflows")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // --- EMPLOYEE ENDPOINTS ---

    @PostMapping("/employee/leaves/apply")
    @Operation(summary = "Submit a new leave application (Employee/Admin)")
    public ResponseEntity<ApiResponse<LeaveResponse>> applyLeave(
            Authentication authentication,
            @Valid @RequestBody LeaveApplyRequest request) {
        ApiResponse<LeaveResponse> response = leaveService.applyLeave(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/leaves/history")
    @Operation(summary = "Retrieve logged-in employee leave applications history (Employee/Admin)")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getOwnLeaveHistory(Authentication authentication) {
        ApiResponse<List<LeaveResponse>> response = leaveService.getOwnLeaveHistory(authentication.getName());
        return ResponseEntity.ok(response);
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/admin/leaves/all")
    @Operation(summary = "View all leave requests (Admin only)")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getAllLeaveRequests() {
        ApiResponse<List<LeaveResponse>> response = leaveService.getAllLeaveRequests();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/leaves/{requestId}/approve")
    @Operation(summary = "Approve a leave request (Admin only)")
    public ResponseEntity<ApiResponse<LeaveResponse>> approveLeave(
            @PathVariable String requestId,
            @RequestBody(required = false) LeaveActionRequest request) {
        String comments = (request != null) ? request.getComments() : "";
        ApiResponse<LeaveResponse> response = leaveService.approveLeave(requestId, comments);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/leaves/{requestId}/reject")
    @Operation(summary = "Reject a leave request (Admin only)")
    public ResponseEntity<ApiResponse<LeaveResponse>> rejectLeave(
            @PathVariable String requestId,
            @RequestBody(required = false) LeaveActionRequest request) {
        String comments = (request != null) ? request.getComments() : "";
        ApiResponse<LeaveResponse> response = leaveService.rejectLeave(requestId, comments);
        return ResponseEntity.ok(response);
    }
}
