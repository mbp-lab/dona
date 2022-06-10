package models.api

import play.api.libs.json.{Format, Json}

case class GraphData(
                      sentReceived: List[SentReceivedPoint],
                      sentReceivedWords: List[SentReceivedPoint],
                      sentPerFriendPerMonth: List[FromToYearMonthSentCount],
                      dailySentReceived: List[DailySentReceivedPoint],
                      dailyWordsSentReceived: List[DailySentReceivedPoint],
                      dailySentReceivedPerConversation: List[List[DailySentReceivedPoint]],
                      dailySentHoursPerConversation: List[List[DailyHourPoint]],
                      dailyReceivedHoursPerConversation: List[List[DailyHourPoint]],
                      responseTimes: List[AnswerTimePoint],
                      averageNumberOfMessages: AverageNumberOfMessages,
                      conversationsFriends: List[List[String]],
)

object GraphData {
  implicit val jsonFormat: Format[GraphData] = Json.format[GraphData]
}
