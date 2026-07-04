package com.hrms.dev.service.impl;

import com.hrms.dev.dto.*;
import com.hrms.dev.entity.EmailToken;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.entity.PasswordResetToken;
import com.hrms.dev.entity.User;
import com.hrms.dev.exception.BadRequestException;
import com.hrms.dev.exception.ResourceNotFoundException;
import com.hrms.dev.repository.EmailTokenRepository;
import com.hrms.dev.repository.EmployeeRepository;
import com.hrms.dev.repository.PasswordResetTokenRepository;
import com.hrms.dev.repository.UserRepository;
import com.hrms.dev.security.JwtTokenProvider;
import com.hrms.dev.security.UserPrincipal;
import com.hrms.dev.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailTokenRepository emailTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    @Transactional
    public ApiResponse<String> registerUser(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID is already in use");
        }

        // Determine Role
        User.Role role = User.Role.ROLE_EMPLOYEE;
        if (request.getRole() != null) {
            String roleStr = request.getRole().trim().toUpperCase();
            if (roleStr.equals("ADMIN") || roleStr.equals("ROLE_ADMIN")) {
                role = User.Role.ROLE_ADMIN;
            }
        }

        // Create User
        User user = User.builder()
                .employeeId(request.getEmployeeId())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isEmailVerified(false)
                .build();
        userRepository.save(user);

        // Create Employee Profile Placeholder if not already present
        if (!employeeRepository.existsByEmployeeId(request.getEmployeeId())) {
            String defaultFirstName = request.getEmail().split("@")[0];
            Employee employee = Employee.builder()
                    .employeeId(request.getEmployeeId())
                    .email(request.getEmail())
                    .firstName(defaultFirstName)
                    .lastName("Employee")
                    .dateOfJoining(Instant.now())
                    .build();
            employeeRepository.save(employee);
        }

        // Generate email verification token
        String token = UUID.randomUUID().toString();
        EmailToken emailToken = EmailToken.builder()
                .token(token)
                .email(request.getEmail())
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        emailTokenRepository.deleteByEmail(request.getEmail()); // Delete old token if exists
        emailTokenRepository.save(emailToken);

        log.info("Placeholder email verification token for email {}: {}", request.getEmail(), token);

        return ApiResponse.success("Registration successful. Please verify your email using token: " + token, token);
    }

    @Override
    public ApiResponse<JwtResponse> authenticateUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        JwtResponse jwtResponse = JwtResponse.builder()
                .token(jwt)
                .email(userPrincipal.getEmail())
                .employeeId(userPrincipal.getEmployeeId())
                .role(userPrincipal.getAuthorities().iterator().next().getAuthority())
                .build();

        return ApiResponse.success("Login successful", jwtResponse);
    }

    @Override
    public ApiResponse<String> verifyEmail(String token) {
        EmailToken emailToken = emailTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired email verification token"));

        if (emailToken.getExpiryDate().isBefore(Instant.now())) {
            emailTokenRepository.delete(emailToken);
            throw new BadRequestException("Email verification token has expired");
        }

        User user = userRepository.findByEmail(emailToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found for this token"));

        user.setEmailVerified(true);
        userRepository.save(user);

        emailTokenRepository.delete(emailToken);
        log.info("Email verified successfully for: {}", user.getEmail());

        return ApiResponse.success("Email verified successfully");
    }

    @Override
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // For security reasons, don't reveal that the user does not exist
            return ApiResponse.success("If the email is registered, a password reset link has been sent.");
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .email(request.getEmail())
                .expiryDate(Instant.now().plus(1, ChronoUnit.HOURS))
                .build();

        passwordResetTokenRepository.deleteByEmail(request.getEmail()); // Delete old token if exists
        passwordResetTokenRepository.save(resetToken);

        log.info("Placeholder password reset token for email {}: {}", request.getEmail(), token);

        return ApiResponse.success("Password reset token generated: " + token, token);
    }

    @Override
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Password reset token has expired");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
        log.info("Password reset successful for: {}", user.getEmail());

        return ApiResponse.success("Password has been reset successfully");
    }

    @Override
    public ApiResponse<String> logout() {
        SecurityContextHolder.clearContext();
        return ApiResponse.success("Logged out successfully");
    }
}
