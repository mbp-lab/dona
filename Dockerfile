# must not end with '/'
ARG CACHE_DOCKER_REPO=sjohannknecht
ARG CACHE_IMAGE=hc-rp-kalinka-cache
FROM ${CACHE_DOCKER_REPO}/${CACHE_IMAGE}:latest as builder
RUN sed -i '/http:\/\/security.debian.org\/debian-security\|http:\/\/deb.debian.org\/debian/d' /etc/apt/sources.list
RUN echo "deb http://archive.debian.org/debian stretch main contrib non-free" >> /etc/apt/sources.list
RUN apt-get update
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs
WORKDIR /workspace
COPY build.sbt ./build.sbt
COPY project ./project
COPY ./ ./

RUN npm install
RUN npm config set unsafe-perm true
RUN npm install -g browserify

RUN npm test
RUN sbt test
RUN sbt -J-Xms2048m -J-Xmx2048m assembly

# final container to run kalinka
# Needs JRE-8, because JRE-11 is not fully supported yet:
#   "As of Scala 2.13.0, 2.12.8 and 2.11.12, JDK 11 support is incomplete."
#   "Scala 2.13.x will eventually provide rudimentary support for this, but likely only in nightlies built on Java 11."
FROM openjdk:8-jre-stretch
COPY --from=builder /workspace/target/scala-2.12/hc-rp-kalinka.jar /opt/hc-rp-kalinka.jar

LABEL version="0.1.1"

EXPOSE 9000

RUN useradd --user-group --system --create-home --no-log-init dona
USER dona

CMD ["java", "-jar", "/opt/hc-rp-kalinka.jar"]
