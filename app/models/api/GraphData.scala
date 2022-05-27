package models.api

import play.api.libs.json.{Format, Json}

case class GraphData(
  sentReceived: List[SentReceivedPoint],
  dailySentReceived: List[DailySentReceivedPoint],
  dailySentReceivedPerConversation: List[List[DailySentReceivedPoint]],
  dailySentHourMinutesPerConversation: List[List[DailyHourPoint]],
  dailyReceivedHourMinutesPerConversation: List[List[DailyHourPoint]],
  responseTimes: List[AnswerTimePoint],
  averageNumberOfMessages: AverageNumberOfMessages,
  //conversationsFriends: List[List[String]],
)

object GraphData {
  implicit val jsonFormat: Format[GraphData] = Json.format[GraphData]
}
