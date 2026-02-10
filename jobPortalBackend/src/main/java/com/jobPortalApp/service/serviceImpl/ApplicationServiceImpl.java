package com.jobPortalApp.service.serviceImpl;

import com.jobPortalApp.model.Application;
import com.jobPortalApp.model.Job;
import com.jobPortalApp.repository.ApplicationRepository;
import com.jobPortalApp.repository.JobRepository;
import com.jobPortalApp.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository appRepo;
    private final JobRepository jobRepo;

    @Override
    public Application apply(Long jobId, Long userId) {
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));

        // Prevent applications on unpublished/closed jobs (recommended)
        if (Boolean.FALSE.equals(job.getIsPublished())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job is closed/unpublished");
        }

        // Enforce deadline (inclusive)
        LocalDate today = LocalDate.now();
        if (job.getApplyDeadline() != null && today.isAfter(job.getApplyDeadline())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apply deadline has passed");
        }

        if (appRepo.existsByJob_IdAndUserId(jobId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already applied");
        }

        Application app = new Application();
        app.setJob(job);
        app.setUserId(userId);
        app.setStatus(Application.Status.APPLIED);
        return appRepo.save(app);
    }

    @Override
    public Application withdraw(Long applicationId, Long userId) {
        Application app = appRepo.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your application");
        }

        if (app.getStatus() == Application.Status.WITHDRAWN) {
            return app; // idempotent
        }

        app.setStatus(Application.Status.WITHDRAWN);
        return appRepo.save(app);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> myApplications(Long userId) {
        return appRepo.findByUserId(userId);
    }
}