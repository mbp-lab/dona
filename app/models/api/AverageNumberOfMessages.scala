package models.api

import play.api.libs.json.{Format, Json}

case class AverageNumberOfMessages(
  sentTotal: Int,
  receivedTotal: Int,
  numberOfActiveMonths: Int,
  numberOfActiveYears: Int,
  sentPerActiveMonth: Int,
  receivedPerActiveMonth: Int
)

object AverageNumberOfMessages {
  implicit val jsonFormat: Format[AverageNumberOfMessages] = Json.format[AverageNumberOfMessages]
}
