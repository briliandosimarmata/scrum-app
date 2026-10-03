package com.scrumku.scrumapp.sprint.entity;

import com.scrumku.scrumapp.master.project.entity.Project;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "sprints")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "story_points_per_day", nullable = false)
    private Integer storyPointsPerDay;

    @Column(name = "start_date", nullable = false, columnDefinition = "DATE")
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false, columnDefinition = "DATE")
    private LocalDate endDate;

    @Column(name = "specific_holidays", nullable = false, columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> specificHolidays;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Version
    private Long version;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Utility methods for date operations
    public List<LocalDate> getHolidaysAsDates() {
        return specificHolidays.stream()
                .map(LocalDate::parse)
                .sorted()
                .collect(Collectors.toList());
    }

    public void setHolidaysFromDates(List<LocalDate> dates) {
        this.specificHolidays = dates.stream()
                .map(LocalDate::toString)
                .collect(Collectors.toList());
    }

    public boolean isHoliday(LocalDate date) {
        return specificHolidays.contains(date.toString());
    }

    public List<LocalDate> getHolidaysInRange(LocalDate start, LocalDate end) {
        return getHolidaysAsDates().stream()
                .filter(holiday -> !holiday.isBefore(start) && !holiday.isAfter(end))
                .sorted()
                .collect(Collectors.toList());
    }

    public int getTotalWorkDays() {
        if (startDate == null || endDate == null) {
            return 0;
        }

        LocalDate current = startDate;
        int workDays = 0;

        while (!current.isAfter(endDate)) {
            // Skip weekends (Saturday = 6, Sunday = 0)
            if (current.getDayOfWeek().getValue() < 6) {
                // Skip holidays
                if (!isHoliday(current)) {
                    workDays++;
                }
            }
            current = current.plusDays(1);
        }

        return workDays;
    }
}
