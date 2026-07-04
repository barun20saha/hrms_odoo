package com.hrms.dev.service.impl;

import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.LeaveApplyRequest;
import com.hrms.dev.dto.LeaveResponse;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.entity.LeaveRequest;
import com.hrms.dev.entity.LeaveRequest.LeaveType;
import com.hrms.dev.entity.LeaveRequest.Status;
import com.hrms.dev.exception.BadRequestException;
import com.hrms.dev.exception.ResourceNotFoundException;
import com.hrms.dev.mapper.EntityMapper;
import com.hrms.dev.repository.EmployeeRepository;
import com.hrms.dev.repository.LeaveRequestRepository;
import com.hrms.dev.service.LeaveService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class LeaveServiceImpl implements LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Override
    public ApiResponse<LeaveResponse> applyLeave(String email, LeaveApplyRequest request) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for email: " + email));

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        LeaveType leaveType;
        try {
            leaveType = LeaveType.valueOf(request.getLeaveType().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid leave type. Supported types: PAID, SICK, UNPAID");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employeeId(employee.getEmployeeId())
                .leaveType(leaveType)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .remarks(request.getRemarks())
                .status(Status.PENDING)
                .appliedDate(Instant.now())
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave request applied for employee {} from {} to {}", 
                employee.getEmployeeId(), saved.getStartDate(), saved.getEndDate());

        return ApiResponse.success("Leave application submitted successfully", entityMapper.toLeaveResponse(saved));
    }

    @Override
    public ApiResponse<List<LeaveResponse>> getOwnLeaveHistory(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for email: " + email));

        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeId(employee.getEmployeeId());
        List<LeaveResponse> responses = requests.stream()
                .map(entityMapper::toLeaveResponse)
                .collect(Collectors.toList());

        return ApiResponse.success("Leave history retrieved successfully", responses);
    }

    @Override
    public ApiResponse<List<LeaveResponse>> getAllLeaveRequests() {
        List<LeaveRequest> requests = leaveRequestRepository.findAll();
        List<LeaveResponse> responses = requests.stream()
                .map(entityMapper::toLeaveResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("All leave requests retrieved", responses);
    }

    @Override
    public ApiResponse<LeaveResponse> approveLeave(String requestId, String adminComments) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        if (leaveRequest.getStatus() != Status.PENDING) {
            throw new BadRequestException("Leave request is already processed and is: " + leaveRequest.getStatus());
        }

        leaveRequest.setStatus(Status.APPROVED);
        leaveRequest.setAdminComments(adminComments);

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        log.info("Leave request ID {} approved by admin", requestId);

        return ApiResponse.success("Leave request approved successfully", entityMapper.toLeaveResponse(updated));
    }

    @Override
    public ApiResponse<LeaveResponse> rejectLeave(String requestId, String adminComments) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));

        if (leaveRequest.getStatus() != Status.PENDING) {
            throw new BadRequestException("Leave request is already processed and is: " + leaveRequest.getStatus());
        }

        leaveRequest.setStatus(Status.REJECTED);
        leaveRequest.setAdminComments(adminComments);

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);
        log.info("Leave request ID {} rejected by admin", requestId);

        return ApiResponse.success("Leave request rejected successfully", entityMapper.toLeaveResponse(updated));
    }
}
