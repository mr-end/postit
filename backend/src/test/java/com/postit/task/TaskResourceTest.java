package com.postit.task;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

@QuarkusTest
class TaskResourceTest {

    @Test
    void createListAndDeleteTask() {
        Integer id = given()
                .contentType("application/json")
                .body("""
                        {"title":"Teste","content":"Nota","color":"mint","posX":10,"posY":20}
                        """)
                .when()
                .post("/api/tasks")
                .then()
                .statusCode(201)
                .body("title", is("Teste"))
                .extract()
                .path("id");

        given()
                .when()
                .get("/api/tasks")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1));

        given()
                .when()
                .delete("/api/tasks/" + id)
                .then()
                .statusCode(204);
    }
}
