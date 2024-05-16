package models.api

import models.domain.DonationDataSourceType.DonationDataSourceType
import play.api.libs.json.JsonNaming.SnakeCase
import play.api.libs.json.{Format, Json, JsonConfiguration}

case class GroupComment(
                         groupCommentId: String,
                         donationDataSourceType: DonationDataSourceType,
                         wordCount: Int,
                         mediaCount: Int,
                         timestampMs: Long,
                       )

object GroupComment {
  implicit val config: JsonConfiguration = JsonConfiguration(SnakeCase)
  implicit val jsonFormat: Format[GroupComment] = Json.format[GroupComment]
}
