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
public class EmployeeDashboardResponse {
    private ProfileSummary profileSummary;
    private AttendanceSummary attendanceSummary;
    private LeaveSummary leaveSummary;
    private List<NotificationItem> notifications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileSummary {
        private String employeeId;
        private String firstName;
        private String lastName;
        private String department;
        private String designation;
        private String profilePictureUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceSummary {
        private long presents;
        private long absents;
        private long halfDays;
        private long leaves;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveSummary {
        private long approved;
        private long pending;
        private long rejected;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationItem {
        private String id;
        private String message;
        private String dateString;
    }
}
