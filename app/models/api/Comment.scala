package models.api

import models.domain.DonationDataSourceType.DonationDataSourceType
import play.api.libs.json.JsonNaming.SnakeCase
import play.api.libs.json.{Format, Json, JsonConfiguration}

case class Comment(
                         commentId: String,
                         donationDataSourceType: DonationDataSourceType,
                         wordCount: Int,
                         mediaCount: Int,
                         timestampMs: Long,
                       )

object Comment {
  implicit val config: JsonConfiguration = JsonConfiguration(SnakeCase)
  implicit val jsonFormat: Format[Comment] = Json.format[Comment]
}
