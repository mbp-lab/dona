# must not end with '/'
# ARG CACHE_DOCKER_REPO=sjohannknecht
# ARG CACHE_IMAGE=hc-rp-kalinka-cache
# FROM ${CACHE_DOCKER_REPO}/${CACHE_IMAGE}:latest as builder
FROM dona.tf.uni-bielfeld.de/hc-rp-kalinka-cache:3
RUN apt-get update
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
WORKDIR /workspace

ARG KALINKA_HOST
ARG DONOR_SURVEY_LINK
ARG FEEDBACK_SURVEY_LINK
ARG DONOR_SURVEY_ENABLED
ARG SOCIAL_DATA_INGESTION_ENABLED
ARG APPLICATION_SECRET
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_NAME
ARG DATABASE_USER

ENV KALINKA_HOST=${KALINKA_HOST}
ENV DONOR_SURVEY_LINK=${DONOR_SURVEY_LINK}
ENV FEEDBACK_SURVEY_LINK=${FEEDBACK_SURVEY_LINK}
ENV DONOR_SURVEY_ENABLED=${DONOR_SURVEY_ENABLED}
ENV SOCIAL_DATA_INGESTION_ENABLED=${SOCIAL_DATA_INGESTION_ENABLED}
ENV APPLICATION_SECRET=${APPLICATION_SECRET}
ENV DATABASE_HOST=${DATABASE_HOST}
ENV DATABASE_PORT=${DATABASE_PORT}
ENV DATABASE_NAME=${DATABASE_NAME}
ENV DATABASE_USER=${DATABASE_USER}

### Moved to before COPY for faster building during debugging

COPY build.sbt ./build.sbt
COPY project ./project
COPY ./ ./

# RUN npm install glob@10.4.1
# RUN npm install --save-dev @babel/core @babel/preset-env babelify browserify esmify
# RUN npm config set unsafe-perm true
# RUN npm install --save-def esmify@^2.1.1
# RUN npm install browser-resolve
RUN npm install
RUN npm install -g npm@10.8.1
RUN npm install -g browserify@^17.0.0

### Get list of installed npm packages and dependencies
# RUN npm list --depth=10
# RUN npm list -g --depth=10

# RUN cat /workspace/node_modules/@zip.js/zip.js/lib/zip-fs.js

RUN npm test
RUN sbt clean compile test
# RUN sbt dependencyTree
RUN sbt -J-Xms2048m -J-Xmx2048m assembly

# final container to run kalinka
# Needs JRE-8, because JRE-11 is not fully supported yet:
#   "As of Scala 2.13.0, 2.12.8 and 2.11.12, JDK 11 support is incomplete."
#   "Scala 2.13.x will eventually provide rudimentary support for this, but likely only in nightlies built on Java 11."
# FROM openjdk:8-jre-stretch
FROM eclipse-temurin:21.0.3_9-jre
COPY --from=builder /workspace/target/scala-3.4.2/hc-rp-kalinka.jar /opt/hc-rp-kalinka.jar

LABEL version="0.1.1"

EXPOSE 9000

RUN useradd --user-group --system --create-home --no-log-init dona
RUN mkdir -p logs; touch logs/errors.log; chown -R dona:dona logs 
USER dona

CMD ["java", "-jar", "/opt/hc-rp-kalinka.jar"]
