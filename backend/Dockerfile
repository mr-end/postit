####
# Multi-stage Dockerfile for Quarkus JVM mode
####
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/quarkus-app/lib/ ./lib/
COPY --from=build /build/target/quarkus-app/*.jar ./
COPY --from=build /build/target/quarkus-app/app/ ./app/
COPY --from=build /build/target/quarkus-app/quarkus/ ./quarkus/

EXPOSE 8080
ENV JAVA_OPTS_APPEND="-Dquarkus.http.host=0.0.0.0"
ENV DB_HOST=db
ENV DB_PORT=3306
ENV DB_NAME=postit
ENV DB_USER=postit
ENV DB_PASSWORD=postit

ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]
