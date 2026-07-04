package com.hrms.dev.repository;

import com.hrms.dev.entity.EmailToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailTokenRepository extends MongoRepository<EmailToken, String> {
    Optional<EmailToken> findByToken(String token);
    void deleteByEmail(String email);
}
