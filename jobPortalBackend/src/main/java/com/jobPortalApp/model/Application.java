package com.jobPortalApp.model;


import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications",
  uniqueConstraints = @UniqueConstraint(columnNames = {"job_id","user_id"}))
@Getter @Setter
public class Application {

  public enum Status { APPLIED, WITHDRAWN }

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "job_id", nullable = false)
  private Job job;

  @Column(name = "user_id", nullable = false)
  private Long userId; 

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Status status;

  @Column(nullable = false)
  private LocalDateTime appliedAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;


    @PrePersist
  void onCreate() {
    this.appliedAt = LocalDateTime.now();
    this.updatedAt = this.appliedAt;
  }

  @PreUpdate
  void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}

