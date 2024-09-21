FROM gradle:8.8-jdk17 AS build
WORKDIR /backend
COPY --chown=gradle:gradle . .
RUN gradle build --no-daemon -x test

FROM openjdk:17-jdk-slim
WORKDIR /backend
COPY --from=build /backend/build/libs/*.jar backend.jar
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
EXPOSE 8080
ENTRYPOINT ["/wait-for-it.sh", "db:5432", "--timeout=30", "--", "java", "-jar", "backend.jar"]