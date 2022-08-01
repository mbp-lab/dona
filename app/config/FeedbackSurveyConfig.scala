package config

import akka.http.scaladsl.model.Uri
import com.typesafe.config.Config
import controllers.routes
import models.domain.ExternalDonorId

case class FeedbackSurveyConfig(baseUrl: Uri, surveyEnabled: Boolean = true) {

  def createFeedbackLink(donorId: ExternalDonorId, iso3localeString: String): Uri = {
    if (surveyEnabled) {
      baseUrl.withQuery(("lang" -> iso3localeString) +: ("UID" -> donorId.toString) +: baseUrl.query())
    } // TODO: No else case
  }
}

object FeedbackSurveyConfig {

  def apply(config: Config, surveyEnabled: Boolean): FeedbackSurveyConfig = {
    FeedbackSurveyConfig(Uri(config.getString("url")), surveyEnabled)
  }
}
