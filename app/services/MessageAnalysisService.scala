package services

import java.time.{Instant, LocalDateTime, Month, ZoneOffset}

import config.FeedbackConfig
import javax.inject.{Inject, Singleton}
import models.api._
import models.domain.DonationDataSourceType.DonationDataSourceType

@Singleton
class MessageAnalysisService @Inject()(config: FeedbackConfig) {

  private case class TimeFrame(year: Int, month: Month)
  private case class TimeFrameWithDays(year: Int, month: Month, date: Int)
  private case class TimeFrameWithDaysHourMinute(year: Int, month: Month, date: Int, hour: Int, minute: Int)

  def produceGraphData(socialData: SocialData): Map[DonationDataSourceType, GraphData] = {
    socialData.conversations
      .groupBy(_.donationDataSourceType)
      .mapValues { conversations =>
        val messageGraphData = produceMessageGraphData(socialData.donorId, conversations)
        val dailyMessageGraphData = produceDailyMessageGraphData(socialData.donorId, conversations)
        val dailyWordsGraphData = produceDailyWordsGraphData(socialData.donorId, conversations)
        // this here might be redundant... rather only do smallest and then reassemble in javascript? e.g. per conversation could be easily added up to overall daily
        val dailyMessageGraphDataPerConversation = conversations.map(conversation => produceDailyMessageGraphDataPerConversation(socialData.donorId, conversation))
        //val dailySentHourMinutesPerConversation = conversations.map(conversation => produceDailyHourMinutesPerConversation(socialData.donorId, conversation, true))
        //val dailyReceivedHourMinutesPerConversation = conversations.map(conversation => produceDailyHourMinutesPerConversation(socialData.donorId, conversation, false))
        val dailySentHoursPerConversation = conversations.map(conversation => produceDailyHoursPerConversation(socialData.donorId, conversation, true))
        val dailyReceivedHoursPerConversation = conversations.map(conversation => produceDailyHoursPerConversation(socialData.donorId, conversation, false))
        val average = produceAverageNumberOfMessages(messageGraphData)
        val answerTimes = produceAnswerTimes(socialData.donorId, conversations)
        val conversationsFriends = conversations.map(c => {
          c.participants.map((participant) => {
            // dont pass donorId to front end, instead just pass "donor"
            if (participant == socialData.donorId) {
              "donor"
            }
            else {
              participant
            }
          })
        })
        //println(conversations.map(c => c.participants)) // pass this through so that donor can know "conversation with friend0, 1, 2 ...
        GraphData(
          messageGraphData,
          dailyMessageGraphData,
          dailyWordsGraphData,
          dailyMessageGraphDataPerConversation,
          dailySentHoursPerConversation,
          dailyReceivedHoursPerConversation,
          answerTimes,
          average,
          conversationsFriends
        )
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

  private def produceDailyMessageGraphData(
                                       donorId: String,
                                       conversations: List[Conversation]
                                     ): List[DailySentReceivedPoint] = {

    conversations
      .flatMap(_.messages)
      .foldRight(Map[TimeFrameWithDays, (Int, Int)]()) {
        case (message, map) =>
          val timestamp = LocalDateTime.ofInstant(Instant.ofEpochMilli(message.timestampMs), ZoneOffset.UTC)
          val mapKey = TimeFrameWithDays(timestamp.getYear, timestamp.getMonth, timestamp.getDayOfMonth)
          val (oldSent, oldReceived) = map.getOrElse(mapKey, (0, 0))
          val newValue = message.sender match {
            case Some(sender) if sender == donorId => (oldSent + 1, oldReceived)
            case _                                 => (oldSent, oldReceived + 1)
          }
          map.updated(mapKey, newValue)
      }
      .map {
        case (TimeFrameWithDays(year, month, day), (sent, received)) =>
          DailySentReceivedPoint(year, month.getValue, day, sent, received)
      }
      .toList
      .sorted
      .reverse
  }

  private def produceDailyWordsGraphData(
                                            donorId: String,
                                            conversations: List[Conversation]
                                          ): List[DailySentReceivedPoint] = {

    conversations
      .flatMap(_.messages)
      .foldRight(Map[TimeFrameWithDays, (Int, Int)]()) {
        case (message, map) =>
          val timestamp = LocalDateTime.ofInstant(Instant.ofEpochMilli(message.timestampMs), ZoneOffset.UTC)
          val mapKey = TimeFrameWithDays(timestamp.getYear, timestamp.getMonth, timestamp.getDayOfMonth)
          val (oldSent, oldReceived) = map.getOrElse(mapKey, (0, 0))
          val newValue = message.sender match {
            case Some(sender) if sender == donorId => (oldSent + message.wordCount, oldReceived)
            case _                                 => (oldSent, oldReceived + message.wordCount)
          }
          map.updated(mapKey, newValue)
      }
      .map {
        case (TimeFrameWithDays(year, month, day), (sent, received)) =>
          DailySentReceivedPoint(year, month.getValue, day, sent, received)
      }
      .toList
      .sorted
      .reverse
  }


  private def produceDailyMessageGraphDataPerConversation(
                                            donorId: String,
                                            conversation: Conversation
                                          ): List[DailySentReceivedPoint] = {

      conversation.messages
        .foldRight(Map[TimeFrameWithDays, (Int, Int)]()) {
          case (message, map) =>
            val timestamp = LocalDateTime.ofInstant(Instant.ofEpochMilli(message.timestampMs), ZoneOffset.UTC)
            val mapKey = TimeFrameWithDays(timestamp.getYear, timestamp.getMonth, timestamp.getDayOfMonth)
            val (oldSent, oldReceived) = map.getOrElse(mapKey, (0, 0))
            val newValue = message.sender match {
              case Some(sender) if sender == donorId => (oldSent + 1, oldReceived)
              case _                                 => (oldSent, oldReceived + 1)
            }
            map.updated(mapKey, newValue)
        }
        .map {
          case (TimeFrameWithDays(year, month, date), (sent, received)) =>
            DailySentReceivedPoint(year, month.getValue, date, sent, received)
        }
        .toList
        .sorted
        .reverse

    }

  private def produceDailyHourMinutesPerConversation(
                                                           donorId: String,
                                                           conversation: Conversation,
                                                           sent: Boolean,
                                                         ): List[DailyHourPoint] = {
    conversation.messages
      .filter(message => {
        if (sent) {
          message.sender match {
            case Some(sender) if sender == donorId => true
            case _ => false
          }
        } else {
          message.sender match {
            case Some(sender) if sender != donorId => true
            case _ => false
          }
        }
      })
      .map(message => {
        val timestamp = LocalDateTime.ofInstant(Instant.ofEpochMilli(message.timestampMs), ZoneOffset.UTC)
        TimeFrameWithDaysHourMinute(timestamp.getYear, timestamp.getMonth, timestamp.getDayOfMonth, timestamp.getHour, timestamp.getMinute)
      })
      .distinct
      .map {
        case (TimeFrameWithDaysHourMinute(year, month, date, hour, minute)) =>
          DailyHourPoint(year, month.getValue, date, hour, minute)
      }

  }

  private def produceDailyHoursPerConversation(
                                                      donorId: String,
                                                      conversation: Conversation,
                                                      sent: Boolean,
                                                    ): List[DailyHourPoint] = {
    conversation.messages
      .filter(message => {
        if (sent) {
          message.sender match {
            case Some(sender) if sender == donorId => true
            case _ => false
          }
        } else {
          message.sender match {
            case Some(sender) if sender != donorId => true
            case _ => false
          }
        }
      })
      .map(message => {
        val timestamp = LocalDateTime.ofInstant(Instant.ofEpochMilli(message.timestampMs), ZoneOffset.UTC)
        TimeFrameWithDaysHourMinute(timestamp.getYear, timestamp.getMonth, timestamp.getDayOfMonth, timestamp.getHour, 0)
      })
      .distinct
      .map {
        case (TimeFrameWithDaysHourMinute(year, month, date, hour, minute)) =>
          DailyHourPoint(year, month.getValue, date, hour, minute)
      }

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
