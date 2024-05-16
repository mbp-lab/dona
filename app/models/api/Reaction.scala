package models.api

import models.domain.DonationDataSourceType.DonationDataSourceType
import play.api.libs.json.JsonNaming.SnakeCase
import play.api.libs.json.{Format, Json, JsonConfiguration}

case class Reaction(
                         reactionId: String,
                         donationDataSourceType: DonationDataSourceType,
                         reactionType: String,
                         timestampMs: Long,
                       )

object Reaction {
  implicit val config: JsonConfiguration = JsonConfiguration(SnakeCase)
  implicit val jsonFormat: Format[Reaction] = Json.format[Reaction]
}
