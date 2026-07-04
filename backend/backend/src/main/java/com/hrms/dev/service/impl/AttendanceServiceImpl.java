package com.hrms.dev.service.impl;

import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.AttendanceResponse;
import com.hrms.dev.entity.Attendance;
import com.hrms.dev.entity.Attendance.Status;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.exception.BadRequestException;
import com.hrms.dev.exception.ResourceNotFoundException;
import com.hrms.dev.mapper.EntityMapper;
import com.hrms.dev.repository.AttendanceRepository;
import com.hrms.dev.repository.EmployeeRepository;
import com.hrms.dev.service.AttendanceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Override
    public ApiResponse<AttendanceResponse> checkIn(String email, String remarks) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for email: " + email));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employee.getEmployeeId(), today);
        if (existing.isPresent()) {
            throw new BadRequestException("Already checked in today");
        }

        Attendance attendance = Attendance.builder()
                .employeeId(employee.getEmployeeId())
                .date(today)
                .checkIn(Instant.now())
                .status(Status.PRESENT)
                .remarks(remarks)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Employee {} checked in at {}", employee.getEmployeeId(), saved.getCheckIn());

        return ApiResponse.success("Checked in successfully", entityMapper.toAttendanceResponse(saved));
    }

    @Override
    public ApiResponse<AttendanceResponse> checkOut(String email, String remarks) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for email: " + email));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getEmployeeId(), today)
                .orElseThrow(() -> new BadRequestException("Check-in is required before checking out"));

        if (attendance.getCheckOut() != null) {
            throw new BadRequestException("Already checked out today");
        }

        Instant checkoutTime = Instant.now();
        attendance.setCheckOut(checkoutTime);
        if (remarks != null && !remarks.trim().isEmpty()) {
            attendance.setRemarks(remarks);
        }

        // Calculate hours
        double hours = Duration.between(attendance.getCheckIn(), checkoutTime).toMillis() / 3600000.0;
        // round to 2 decimal places
        hours = Math.round(hours * 100.0) / 100.0;
        attendance.setTotalHours(hours);

        // status calculation: if hours < 4, half day, else present
        if (hours < 4.0) {
            attendance.setStatus(Status.HALF_DAY);
        } else {
            attendance.setStatus(Status.PRESENT);
        }

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Employee {} checked out at {}. Hours worked: {}", employee.getEmployeeId(), saved.getCheckOut(), hours);

        return ApiResponse.success("Checked out successfully", entityMapper.toAttendanceResponse(saved));
    }

    @Override
    public ApiResponse<List<AttendanceResponse>> getOwnAttendanceHistory(String email, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for email: " + email));

        List<Attendance> records;
        if (startDate != null && endDate != null) {
            records = attendanceRepository.findByEmployeeIdAndDateBetween(employee.getEmployeeId(), startDate, endDate);
        } else {
            records = attendanceRepository.findByEmployeeId(employee.getEmployeeId());
        }

        List<AttendanceResponse> responses = records.stream()
                .map(entityMapper::toAttendanceResponse)
                .collect(Collectors.toList());

        return ApiResponse.success("Attendance history retrieved", responses);
    }

    @Override
    public ApiResponse<List<AttendanceResponse>> getAllAttendance() {
        List<Attendance> records = attendanceRepository.findAll();
        List<AttendanceResponse> responses = records.stream()
                .map(entityMapper::toAttendanceResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("All attendance records retrieved", responses);
    }

    @Override
    public ApiResponse<List<AttendanceResponse>> getDailyAttendance(LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<Attendance> records = attendanceRepository.findByDate(targetDate);
        List<AttendanceResponse> responses = records.stream()
                .map(entityMapper::toAttendanceResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Daily attendance retrieved for " + targetDate, responses);
    }

    @Override
    public ApiResponse<List<AttendanceResponse>> getWeeklyAttendance(LocalDate startDate, LocalDate endDate) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(7);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        List<Attendance> records = attendanceRepository.findByDateBetween(start, end);
        List<AttendanceResponse> responses = records.stream()
                .map(entityMapper::toAttendanceResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Weekly attendance retrieved between " + start + " and " + end, responses);
    }

    @Override
    public ApiResponse<List<AttendanceResponse>> getAttendanceByEmployee(String employeeId) {
        List<Attendance> records = attendanceRepository.findByEmployeeId(employeeId);
        List<AttendanceResponse> responses = records.stream()
                .map(entityMapper::toAttendanceResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Attendance history retrieved for employee: " + employeeId, responses);
    }
}
