package models.api

import play.api.libs.json.{Format, Json}

case class GraphData(
  sentReceived: List[SentReceivedPoint],
  responseTimes: List[AnswerTimePoint],
  averageNumberOfMessages: AverageNumberOfMessages
)

object GraphData {
  implicit val jsonFormat: Format[GraphData] = Json.format[GraphData]
}
