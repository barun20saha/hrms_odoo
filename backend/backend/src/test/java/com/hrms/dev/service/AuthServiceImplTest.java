package com.hrms.dev.service;

import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.SignUpRequest;
import com.hrms.dev.entity.EmailToken;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.entity.User;
import com.hrms.dev.exception.BadRequestException;
import com.hrms.dev.repository.EmailTokenRepository;
import com.hrms.dev.repository.EmployeeRepository;
import com.hrms.dev.repository.UserRepository;
import com.hrms.dev.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmailTokenRepository emailTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private SignUpRequest signUpRequest;

    @BeforeEach
    void setUp() {
        signUpRequest = new SignUpRequest();
        signUpRequest.setEmployeeId("EMP1002");
        signUpRequest.setEmail("emp2@example.com");
        signUpRequest.setPassword("password123");
        signUpRequest.setRole("EMPLOYEE");
    }

    @Test
    void testRegisterUser_Success() {
        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByEmployeeId(signUpRequest.getEmployeeId())).thenReturn(false);
        when(passwordEncoder.encode(signUpRequest.getPassword())).thenReturn("encoded_pass");
        when(employeeRepository.existsByEmployeeId(signUpRequest.getEmployeeId())).thenReturn(false);

        ApiResponse<String> response = authService.registerUser(signUpRequest);

        assertTrue(response.isSuccess());
        assertNotNull(response.getData()); // Contains token
        verify(userRepository, times(1)).save(any(User.class));
        verify(employeeRepository, times(1)).save(any(Employee.class));
        verify(emailTokenRepository, times(1)).save(any(EmailToken.class));
    }

    @Test
    void testRegisterUser_EmailAlreadyInUse() {
        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerUser(signUpRequest));
        verify(userRepository, never()).save(any(User.class));
    }
}
