package com.postit.task;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
public class TaskService {

    public List<Task> listAll() {
        return Task.listAll();
    }

    public Task findById(Long id) {
        Task task = Task.findById(id);
        if (task == null) {
            throw new NotFoundException("Task not found: " + id);
        }
        return task;
    }

    @Transactional
    public Task create(TaskRequest request) {
        if (request.title == null || request.title.isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        Task task = new Task();
        apply(task, request, true);
        task.persist();
        return task;
    }

    @Transactional
    public Task update(Long id, TaskRequest request) {
        Task task = findById(id);
        apply(task, request, false);
        return task;
    }

    @Transactional
    public void delete(Long id) {
        if (!Task.deleteById(id)) {
            throw new NotFoundException("Task not found: " + id);
        }
    }

    private void apply(Task task, TaskRequest request, boolean creating) {
        if (request.title != null) {
            task.title = request.title.trim();
        }
        if (request.content != null) {
            task.content = request.content.trim();
        } else if (creating) {
            task.content = "";
        }
        if (request.color != null && !request.color.isBlank()) {
            task.color = request.color.trim();
        }
        if (request.posX != null) {
            task.posX = request.posX;
        }
        if (request.posY != null) {
            task.posY = request.posY;
        }
        if (request.done != null) {
            task.done = request.done;
        }
    }
}
