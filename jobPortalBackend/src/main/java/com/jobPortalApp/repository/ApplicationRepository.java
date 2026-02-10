package com.jobPortalApp.repository;

import com.jobPortalApp.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Because Application has: private Job job;
    boolean existsByJob_Id(Long jobId);

    long countByJob_Id(Long jobId);

    boolean existsByJob_IdAndUserId(Long jobId, Long userId);

    List<Application> findByUserId(Long userId);
}
