package models.api

import play.api.libs.json.{Format, Json}

case class GraphData(
                      sentReceived: List[SentReceivedPoint],
                      sentReceivedPerMonthPerConversation: List[List[SentReceivedPoint]],
                      dailyWordsSentReceived: List[DailySentReceivedPoint],
                      dailySentReceivedPerConversation: List[List[DailySentReceivedPoint]],
                      dailySentHoursPerConversation: List[List[DailyHourPoint]],
                      dailyReceivedHoursPerConversation: List[List[DailyHourPoint]],
                      responseTimes: List[AnswerTimePoint],
                      responseTimesPerConversation: List[List[AnswerTimePoint]],
                      averageNumberOfMessages: AverageNumberOfMessages,
                      conversationsFriends: List[List[String]],
)

object GraphData {
  implicit val jsonFormat: Format[GraphData] = Json.format[GraphData]
}
