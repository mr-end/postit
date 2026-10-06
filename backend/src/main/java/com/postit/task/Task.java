package com.postit.task;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

@Entity
@Table(name = "tasks")
public class Task extends PanacheEntity {

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    public String title;

    @Size(max = 2000)
    @Column(length = 2000)
    public String content;

    @Column(nullable = false, length = 32)
    public String color = "yellow";

    @Column(name = "pos_x", nullable = false)
    public int posX = 40;

    @Column(name = "pos_y", nullable = false)
    public int posY = 40;

    @Column(nullable = false)
    public boolean done = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt = Instant.now();
}
