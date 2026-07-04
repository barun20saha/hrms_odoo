export interface User {
  id?: string;
  employeeId: string;
  email: string;
  role: 'ROLE_EMPLOYEE' | 'ROLE_ADMIN';
  emailVerified: boolean;
}

export interface SalaryStructure {
  basicSalary: number;
  allowances: number;
  deductions: number;
}

export interface Employee {
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  profilePictureUrl?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  salaryStructure?: SalaryStructure;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  id?: string;
  employeeId: string;
  date: string; // yyyy-MM-dd
  checkIn?: string; // Instant ISO
  checkOut?: string; // Instant ISO
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
  totalHours?: number;
  remarks?: string;
}

export interface LeaveRequest {
  id?: string;
  employeeId: string;
  leaveType: 'PAID' | 'SICK' | 'UNPAID';
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  adminComments?: string;
  appliedDate?: string; // Instant ISO
}

export interface Payroll {
  id?: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: 'PAID' | 'PENDING';
  generatedDate?: string;
  paidDate?: string;
}
