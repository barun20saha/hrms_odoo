package com.hrms.dev.service;

import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.LeaveApplyRequest;
import com.hrms.dev.dto.LeaveResponse;

import java.util.List;

public interface LeaveService {
    ApiResponse<LeaveResponse> applyLeave(String email, LeaveApplyRequest request);
    ApiResponse<List<LeaveResponse>> getOwnLeaveHistory(String email);

    // Admin operations
    ApiResponse<List<LeaveResponse>> getAllLeaveRequests();
    ApiResponse<LeaveResponse> approveLeave(String requestId, String adminComments);
    ApiResponse<LeaveResponse> rejectLeave(String requestId, String adminComments);
}
