package config

import akka.http.scaladsl.model.Uri
import com.typesafe.config.Config
import controllers.routes
import models.domain.ExternalDonorId

case class FeedbackSurveyConfig(baseUrl: Uri) {

  def createFeedbackLink(donorId: ExternalDonorId, iso3localeString: String): Uri = {
    baseUrl.withQuery(("lang" -> iso3localeString) +: ("UID" -> donorId.toString) +: baseUrl.query())
  }
}

object FeedbackSurveyConfig {

  def apply(config: Config): FeedbackSurveyConfig = {
    FeedbackSurveyConfig(Uri(config.getString("url")))
  }
}
