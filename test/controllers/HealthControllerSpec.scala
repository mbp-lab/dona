package controllers

import org.scalatestplus.play._
import play.api.test._
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.Configuration
import org.scalatestplus.play.guice.GuiceOneAppPerTest
import play.api.mvc.ControllerComponents
import play.api.test.Helpers._
import play.api.libs.json.Json

final class HealthControllerSpec extends PlaySpec with GuiceOneAppPerTest with Injecting {

  // Debug purposes: Print the configuration and try to update it
  override def fakeApplication() = {
    val app = new GuiceApplicationBuilder()
      .configure(
        "db.default.driver" -> "org.postgresql.Driver",
        "db.default.url" -> "jdbc:postgresql://localhost:5432/yourdatabase",
        "db.default.username" -> "yourusername",
        "db.default.password" -> "yourpassword"
      ).build()

    val config = app.injector.instanceOf[Configuration]
    println("DB Driver: " + config.get[String]("db.default.driver"))
    println("DB URL: " + config.get[String]("db.default.url"))
    println("DB Username: " + config.get[String]("db.default.username"))

    app
  }

  "HealthController GET" should {
    "return status 200 with JSON body" in {
      // val controller = new HealthController(stubControllerComponents())
      val controller = inject[HealthController]
      val health = controller.status.apply(FakeRequest(GET, "/health"))

      status(health) mustBe OK
      contentType(health) mustBe Some("application/json")
      contentAsJson(health) mustBe Json.obj("status" -> "alive")
    }
  }
}
