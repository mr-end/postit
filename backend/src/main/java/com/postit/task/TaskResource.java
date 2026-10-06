package com.postit.task;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Tasks", description = "CRUD for post-it reminder tasks")
public class TaskResource {

    @Inject
    TaskService taskService;

    @GET
    @Operation(summary = "List all tasks")
    public List<Task> list() {
        return taskService.listAll();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a task by id")
    public Task get(@PathParam("id") Long id) {
        return taskService.findById(id);
    }

    @POST
    @Operation(summary = "Create a task")
    public Response create(@Valid TaskRequest request) {
        Task created = taskService.create(request);
        return Response.created(URI.create("/api/tasks/" + created.id)).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update a task")
    public Task update(@PathParam("id") Long id, @Valid TaskRequest request) {
        return taskService.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a task")
    public Response delete(@PathParam("id") Long id) {
        taskService.delete(id);
        return Response.noContent().build();
    }
}
