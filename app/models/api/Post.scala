package models.api

import models.domain.DonationDataSourceType.DonationDataSourceType
import play.api.libs.json.{Format, Json, JsonConfiguration}
import play.api.libs.json.JsonNaming.SnakeCase

case class Post(
                         postId: String,
                         donationDataSourceType: DonationDataSourceType,
                         wordCount: Int,
                         mediaCount: Int,
                         timestampMs: Long,
                       )

object Post {
  implicit val config: JsonConfiguration = JsonConfiguration(SnakeCase)
  implicit val jsonFormat: Format[Post] = Json.format[Post]
}
