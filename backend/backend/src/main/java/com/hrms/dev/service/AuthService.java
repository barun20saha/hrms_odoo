package com.hrms.dev.service;

import com.hrms.dev.dto.*;

public interface AuthService {
    ApiResponse<String> registerUser(SignUpRequest request);
    ApiResponse<JwtResponse> authenticateUser(LoginRequest request);
    ApiResponse<String> verifyEmail(String token);
    ApiResponse<String> forgotPassword(ForgotPasswordRequest request);
    ApiResponse<String> resetPassword(ResetPasswordRequest request);
    ApiResponse<String> logout();
}
