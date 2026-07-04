package com.hrms.dev.service;

import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.EmployeeCreateRequest;
import com.hrms.dev.dto.EmployeeResponse;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.exception.BadRequestException;
import com.hrms.dev.exception.ResourceNotFoundException;
import com.hrms.dev.mapper.EntityMapper;
import com.hrms.dev.repository.EmployeeRepository;
import com.hrms.dev.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Spy
    private EntityMapper entityMapper = new EntityMapper();

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private EmployeeCreateRequest createRequest;
    private Employee employee;

    @BeforeEach
    void setUp() {
        createRequest = new EmployeeCreateRequest();
        createRequest.setEmployeeId("EMP1001");
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.doe@example.com");
        createRequest.setDateOfJoining(Instant.now());
        createRequest.setBasicSalary(50000.0);

        employee = Employee.builder()
                .id("1")
                .employeeId("EMP1001")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .dateOfJoining(createRequest.getDateOfJoining())
                .build();
    }

    @Test
    void testCreateEmployee_Success() {
        when(employeeRepository.existsByEmployeeId(createRequest.getEmployeeId())).thenReturn(false);
        when(employeeRepository.existsByEmail(createRequest.getEmail())).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        ApiResponse<EmployeeResponse> response = employeeService.createEmployee(createRequest);

        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals("EMP1001", response.getData().getEmployeeId());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void testCreateEmployee_AlreadyExists() {
        when(employeeRepository.existsByEmployeeId(createRequest.getEmployeeId())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> employeeService.createEmployee(createRequest));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void testGetEmployeeById_Success() {
        when(employeeRepository.findByEmployeeId("EMP1001")).thenReturn(Optional.of(employee));

        ApiResponse<EmployeeResponse> response = employeeService.getEmployeeById("EMP1001");

        assertTrue(response.isSuccess());
        assertEquals("John", response.getData().getFirstName());
    }

    @Test
    void testGetEmployeeById_NotFound() {
        when(employeeRepository.findByEmployeeId("EMP1001")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getEmployeeById("EMP1001"));
    }
}
