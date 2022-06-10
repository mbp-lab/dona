package services

import java.time.{Instant, LocalDateTime, Month, ZoneOffset}

import config.FeedbackConfig
import javax.inject.{Inject, Singleton}
import models.api._
import models.domain.DonationDataSourceType.DonationDataSourceType

@Singleton
class MessageAnalysisService @Inject()(config: FeedbackConfig) {

  private case class TimeFrame(year: Int, month: Month)
  private case class FriendTimeFrame(friend: Option[String], year: Int, month: Month)
  private case class FromToTimeFrame(from: String, to: String, year: Int, month: Int)
  private case class TimeFrameWithDays(year: Int, month: Month, date: Int)
  private case class TimeFrameWithDaysHourMinute(year: Int, month: Month, date: Int, hour: Int, minute: Int)


  // produces the GraphData object by calling all the different data transformation functions
  def produceGraphData(socialData: SocialData): Map[DonationDataSourceType, GraphData] = {
    socialData.conversations
      .groupBy(_.donationDataSourceType)
      .mapValues { conversations =>
        val messageGraphData = produceMessageGraphData(socialData.donorId, conversations)
        val sentReceivedWords = produceSentReceivedWordsGraphData(socialData.donorId, conversations)
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
          c.participants.filter(
            participant => {
              participant != socialData.donorId
          })
        })
        val sentPerFriendPerMonth = produceAggregatedSentPerFriend(socialData.donorId, conversations)


        GraphData(
          messageGraphData,
          sentReceivedWords,
          sentPerFriendPerMonth,
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

  // counts total received and sent messages per month
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

  // counts total received and sent words per month
  private def produceSentReceivedWordsGraphData(
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
            case Some(sender) if sender == donorId => (oldSent + message.wordCount, oldReceived)
            case _                                 => (oldSent, oldReceived + message.wordCount)
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

  // helper for produceAggregatedSentPerFriend function
  // produces a list of FromToListYearMonthSentCount objects
  // One object per sender and per month contains the information:
  // from: sender, to: List[receivers], year, month, sentWords
  private def produceMonthlySentPerFriendInConversation(
                                          donorId: String,
                                          conversation: Conversation
                                        ): List[FromToListYearMonthSentCount] = {

    val conversationFriends = conversation.participants.filter(participant => {
      participant != donorId
    })

    conversation.messages
      .foldRight(Map[FriendTimeFrame, (Int)]()) {
        case (message, map) =>
          val timestamp = LocalDateTime.ofInstant(Instant.ofEpochMilli(message.timestampMs), ZoneOffset.UTC)
          val mapKey = FriendTimeFrame(message.sender, timestamp.getYear, timestamp.getMonth)
          // weird behavior here when testing files with only a few entries -> date and month gets confused (probably an international problem?)
          // maybe does not matter, as small files like that wont actually appear
          //println("HERE IS SENDER: " + message.sender)
          //println("HERE IS GETMONTH:" + timestamp.getMonth)
          //println("HERE IS GetValue:" + timestamp.getMonth.getValue)
          val oldSent = map.getOrElse(mapKey, 0)
          val newValue = oldSent + message.wordCount
          map.updated(mapKey, newValue)
      }
      .map {
        case (FriendTimeFrame(friend, year, month), (sent)) =>

          friend match {
            case Some(friend) if friend == donorId => FromToListYearMonthSentCount("donor", conversationFriends, year, month.getValue, sent)
            case Some(friend)                      => FromToListYearMonthSentCount(friend, conversationFriends, year, month.getValue, sent)
          }
      }
      .toList
      .sorted
      .reverse
  }


  // aggregates the information returned from produceMonthlySentPerFriendInConversation
  // in the end the information is a List of FromToYearMonthSentCount objects
  // that is: per month per sender - receiver pair the amount of sent words
  // List[{form: sender, to: receiver, year, month, sentWords}]
  private def produceAggregatedSentPerFriend(
                                                         donorId: String,
                                                         conversations: List[Conversation]
                                                       ): List[FromToYearMonthSentCount] = {


    conversations
      .flatMap(c => produceMonthlySentPerFriendInConversation(donorId, c))
      .foldRight(Map[FromToTimeFrame, Int]()) {
        case (friendSent, map) => {

          friendSent.from match {
            case sender if sender == "donor" => {
              /*
              friendSent.to.foldRight(Map[FromToTimeFrame, Int]()) {
                case (receiver, innerMap) => {
                    val mapKey = FromToTimeFrame("donor", receiver, friendSent.year, friendSent.month)
                    val oldSent = map.getOrElse((mapKey), 0)
                    val newValue = oldSent + friendSent.sentCount
                    map.updated(mapKey, newValue)
                }

              }
              */
              //println(friendSent.to)
              var mapToReturn = map
              friendSent.to.foreach((receiver) => {
                //println(receiver)
                val mapKey = FromToTimeFrame("donor", receiver, friendSent.year, friendSent.month)
                val oldSent = mapToReturn.getOrElse((mapKey), 0)
                val newValue = oldSent + friendSent.sentCount
                //println("mapKey: " + mapKey)
                //println("newValue: " + newValue)
                mapToReturn = mapToReturn.updated(mapKey, newValue)
              })
              //println(mapToReturn)
              mapToReturn
            }
            case sender if sender != "donor"   => {
              val mapKey = FromToTimeFrame(sender, "donor", friendSent.year, friendSent.month)
              val oldSent = map.getOrElse((mapKey), 0)
              val newValue = oldSent + friendSent.sentCount
              map.updated(mapKey, newValue)
            }
          }
        }
      }
      .map {
      case (FromToTimeFrame(from, to, year, month), (sent)) =>
        FromToYearMonthSentCount(from, to, year, month, sent)
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
