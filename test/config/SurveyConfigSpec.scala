package config

import akka.http.scaladsl.model.Uri
import models.domain.ExternalDonorId
import org.scalatest.{FreeSpec, Matchers}

final class SurveyConfigSpec extends FreeSpec with Matchers {
  "Generating a donor's URL" - {
    "for a base URL already without a query parameter" - {
      val url = Uri("http://survey-host.com/survey")
      val config = SurveyConfig(url)
      val donorId = ExternalDonorId("testId")

      "should add their ID as a query parameter and language english" in {
        config.createDonorLink(donorId, "eng").query() should contain theSameElementsAs List(
          "r" -> "testId",
          "l" -> "eng"
        )
      }

      "should add their ID as a query parameter and language german" in {
        config.createDonorLink(donorId, "deu").query() should contain theSameElementsAs List(
          "r" -> "testId",
          "l" -> "deu"
        )
      }
    }

    "for a base URL already containing a query parameter" - {
      "should add their ID as an additional parameter" in {
        val url = Uri("http://survey-host.com/survey?act=1234")
        val config = SurveyConfig(url)
        val donorId = ExternalDonorId("testId")
        config.createDonorLink(donorId, "eng").query() should contain theSameElementsAs List(
          "r" -> "testId",
          "act" -> "1234",
          "l" -> "eng"
        )
      }
    }
  }
}
