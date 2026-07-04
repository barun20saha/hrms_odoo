package com.hrms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalEmployees;
    private long presentToday;
    private long absentToday;
    private long pendingLeaveRequests;
    private List<AttendanceResponse> recentAttendance;
}
