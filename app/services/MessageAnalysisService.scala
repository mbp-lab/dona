package services

import java.time.{Instant, LocalDateTime, Month, ZoneOffset}

import config.FeedbackConfig
import javax.inject.{Inject, Singleton}
import models.api._
import models.domain.DonationDataSourceType.DonationDataSourceType

@Singleton
class MessageAnalysisService @Inject()(config: FeedbackConfig) {

  private case class TimeFrame(year: Int, month: Month)

  def produceGraphData(socialData: SocialData): Map[DonationDataSourceType, GraphData] = {
    socialData.conversations
      .groupBy(_.donationDataSourceType)
      .mapValues { conversations =>
        val messageGraphData = produceMessageGraphData(socialData.donorId, conversations)
        val average = produceAverageNumberOfMessages(messageGraphData)
        val answerTimes = produceAnswerTimes(socialData.donorId, conversations)
        GraphData(messageGraphData, answerTimes, average)
      }
  }

  private def produceMessageGraphData(
    donorId: String,
    conversations: List[Conversation]
  ): List[SentReceivedPoint] = {
    conversations
      .flatMap(_.messages)
      .foldRight(Map[TimeFrame, (Int, Int)]()) {
        case (message, map) =>
          val timestamp = LocalDateTime.ofInstant(Instant.ofEpochMilli(message.timestampMs), ZoneOffset.UTC)
          val mapKey = TimeFrame(timestamp.getYear, timestamp.getMonth)
          val (oldSent, oldReceived) = map.getOrElse(mapKey, (0, 0))
          val newValue = message.sender match {
            case Some(sender) if sender == donorId => (oldSent + 1, oldReceived)
            case _                                 => (oldSent, oldReceived + 1)
          }
          map.updated(mapKey, newValue)
      }
      .map {
        case (TimeFrame(year, month), (sent, received)) =>
          SentReceivedPoint(year, month.getValue, sent, received)
      }
      .toList
      .sorted
      .reverse
  }

  private def produceAnswerTimes(donorId: String, conversations: List[Conversation]): List[AnswerTimePoint] = {
    def isAnswer(message1: ConversationMessage, message2: ConversationMessage) = {
      message1.sender != message2.sender &&
      message2.timestampMs > message1.timestampMs &&
      message2.timestampMs - message1.timestampMs < config.maximumResponseWait.toMillis
    }

    conversations
      .flatMap { conversation =>
        conversation.messages.map(message => (message, conversation))
      }
      .sortBy { case (message, _) => -message.timestampMs }
      .take(config.maximumSampleSize)
      .groupBy { case (_, conversation) => conversation }
      .mapValues(_.map { case (message, _) => message })
      .flatMap {
        case (_, list) =>
          list
            .sortBy(message => message.timestampMs)
            .sliding(2)
            .collect {
              case message1 :: message2 :: Nil if isAnswer(message1, message2) =>
                AnswerTimePoint(
                  (message2.timestampMs - message1.timestampMs).toInt,
                  message1.sender.contains(donorId)
                )
            }
      }
      .toList
  }

  private def produceAverageNumberOfMessages(points: List[SentReceivedPoint]): AverageNumberOfMessages = {
    val overallSentMessages = points.map(_.sentCount).sum
    val overallReceivedMessages = points.map(_.receivedCount).sum

    val activeMonths = points.length
    val activeYears = getNumberOfDistinctYears(points)

    val averageSentPerActiveMonth = overallSentMessages / activeMonths
    val averageReceivedPerActiveMonth = overallReceivedMessages / activeMonths

    AverageNumberOfMessages(
      sentTotal = overallSentMessages,
      receivedTotal = overallReceivedMessages,
      numberOfActiveMonths = activeMonths,
      numberOfActiveYears = activeYears,
      sentPerActiveMonth = averageSentPerActiveMonth,
      receivedPerActiveMonth = averageReceivedPerActiveMonth
    )
  }

  private def getNumberOfDistinctYears(graphDataPoints: List[SentReceivedPoint]): Int = {
    graphDataPoints.map(_.year).distinct.length
  }
}
