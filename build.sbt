import java.io.FilenameFilter

import sbt.internal.io.Source
import scala.sys.process._

name := "hc-rp-kalinka"

version := "0.1.1"

scalaVersion := "3.4.2"

resolvers += "Sonatype OSS Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots/"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

libraryDependencies += guice
libraryDependencies += ws
libraryDependencies += jdbc
libraryDependencies += "org.scalaz" %% "scalaz-core" % "7.3.8"
libraryDependencies += "org.webjars" % "bootstrap" % "5.3.3" exclude("org.webjars", "jquery")
libraryDependencies += "org.webjars" % "jquery" % "3.7.1"
libraryDependencies += "org.webjars" % "font-awesome" % "6.5.2"
libraryDependencies += "net.logstash.logback" % "logstash-logback-encoder" % "7.4"
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.1" % Test
libraryDependencies += specs2 % Test
libraryDependencies += "org.flywaydb" %% "flyway-play" % "9.1.0"
libraryDependencies += "org.postgresql" % "postgresql" % "42.7.3"
libraryDependencies += "org.playframework" %% "play-json" % "3.0.3"
libraryDependencies += "com.typesafe.slick" %% "slick" % "3.5.1"
libraryDependencies += "org.playframework"  %% "play-slick" % "6.1.0"
libraryDependencies += "com.github.tminglei" %% "slick-pg" % "0.22.2"
libraryDependencies += "org.typelevel" %% "cats-core" % "2.11.0"
libraryDependencies += "org.typelevel" %% "cats-effect" % "3.5.4"
libraryDependencies += "org.typelevel" %% "cats-mtl" % "1.4.0"
libraryDependencies += "org.typelevel" %% "cats-free" % "2.11.0"
// libraryDependencies += "com.fasterxml.jackson.core" % "jackson-databind" % "2.14.3"
// libraryDependencies += "com.fasterxml.jackson.module" %% "jackson-module-scala" % "2.14.3"

dependencyOverrides ++= Seq(
  "com.fasterxml.jackson.core" % "jackson-databind" % "2.14.3",
  "com.fasterxml.jackson.core" % "jackson-core" % "2.14.3",
  "com.fasterxml.jackson.core" % "jackson-annotations" % "2.14.3"
)

assembly / assemblyJarName := "hc-rp-kalinka.jar"
assembly / mainClass := Some("play.core.server.ProdServerStart")
assembly / fullClasspath += Attributed.blank(PlayKeys.playPackageAssets.value)

Test / javaOptions ++= Seq(
  "-Dconfig.resource=test.conf",
  "-XX:+EnableDynamicAgentLoading",
  s"-Dlogback.configurationFile=${baseDirectory.value / "conf" / "logback.xml"}"
)

assembly / assemblyMergeStrategy := {
  case manifest if manifest.contains("MANIFEST.MF") => MergeStrategy.discard
  case referenceOverrides if referenceOverrides.contains("reference-overrides.conf") =>  MergeStrategy.concat
  case x =>
    val oldStrategy = (assembly / assemblyMergeStrategy).value
    oldStrategy(x)
}
assembly / test := {}

val browserifyTask = taskKey[Seq[File]]("Run browserify")

val browserifyOutputDir = settingKey[File]("Browserify output directory")
browserifyOutputDir := new File("public").getAbsoluteFile / "javascripts"

val bundleOutput = settingKey[File]("Location of generated bundle.js")
bundleOutput := browserifyOutputDir.value / "bundle.js"

val plotOutput = settingKey[File]("Location of generated plot.js")
plotOutput := browserifyOutputDir.value / "plot.js"

browserifyTask := {
  val cacheFunction = FileFunction.cached(streams.value.cacheDirectory) { _ =>
    println("Running browserify")
    browserifyOutputDir.value.mkdirs
    val shell: Seq[String] = if (sys.props("os.name").contains("Windows")) Seq("cmd", "/c") else Seq("bash", "-c")
    val mainCmd = shell :+ s"browserify javascripts/main.js -o ${bundleOutput.value.getPath}"
    val plotCmd = shell :+ s"browserify javascripts/thanks.js -o ${plotOutput.value.getPath}"
    val status: Int = (mainCmd #&& plotCmd !)
    if (status != 0) throw new IllegalStateException("browserify failed!")
    Set(bundleOutput.value, plotOutput.value)
  }
  cacheFunction(new File("javascripts").listFiles().toSet)
  List()
}

Compile / unmanagedResourceDirectories += new File("javascripts")
Compile / sourceGenerators +=  browserifyTask.taskValue
cleanFiles ++= Seq(bundleOutput.value, plotOutput.value)
