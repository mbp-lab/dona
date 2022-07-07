package services

import java.time.{LocalDateTime, ZoneOffset}

import config.FeedbackConfig
import models.api.{AverageNumberOfMessages, ConversationMessage, _}
import models.domain.DonationDataSourceType
import models.domain.DonationDataSourceType.DonationDataSourceType
import org.scalatest.{FreeSpec, Matchers}

import scala.concurrent.duration._

final class MessageAnalysisServiceTest extends FreeSpec with Matchers {
  import MessageAnalysisServiceTest._
  "Producing graph data for social data" - {
    lazy val service = createService()

    testCases.foreach {
      case TestCase(name, socialData, expectedGraph) =>
        name - {
          lazy val result = service.produceGraphData(socialData)

          "should produce the correct data sources" in {
            result.keySet should contain theSameElementsAs expectedGraph.keySet
          }

          for (key <- result.keySet) {
            lazy val (expectedAverages, expectedSentReceived) = expectedGraph(key)
            s"should produce the expected $key graph data points" in {
              result(key).sentReceived should contain theSameElementsAs expectedSentReceived
            }

            s"should produce the expected $key averages" in {
              result(key).averageNumberOfMessages shouldBe expectedAverages
            }
          }
        }
    }
  }

  "Producing answer times" - {
    lazy val service = createService(1.day)
    "should produce data points with the time difference" in {
      val instant1 = LocalDateTime.now()
      val instant2 = instant1.plusMinutes(10)
      val data = SocialData(
        "test",
        List(
          Conversation(
            false,
            "test",
            List("abc", "def"),
            List(
              ConversationMessage(3, instant1.toInstant(ZoneOffset.UTC).toEpochMilli(), Some("abc")),
              ConversationMessage(5, instant2.toInstant(ZoneOffset.UTC).toEpochMilli, Some("def"))
            ),
            DonationDataSourceType.Facebook
          )
        )
      )

      val result = service.produceGraphData(data)

      result.keySet should contain theSameElementsAs List(DonationDataSourceType.Facebook)

      result(DonationDataSourceType.Facebook).responseTimes should contain theSameElementsAs List(
        AnswerTimePoint(60 * 10 * 1000, false, instant1.toInstant(ZoneOffset.UTC).toEpochMilli())
      )
    }

    "should not produce any data points if the time difference is greater than the cutoff" in {
      val instant1 = LocalDateTime.now()
      val instant2 = instant1.plusDays(2)
      val data = SocialData(
        "test",
        List(
          Conversation(
            false,
            "test",
            List("abc", "def"),
            List(
              ConversationMessage(3, instant1.toInstant(ZoneOffset.UTC).toEpochMilli(), Some("abc")),
              ConversationMessage(5, instant2.toInstant(ZoneOffset.UTC).toEpochMilli, Some("def"))
            ),
            DonationDataSourceType.Facebook
          )
        )
      )

      service.produceGraphData(data)(DonationDataSourceType.Facebook).responseTimes shouldBe empty
    }

    "should not product data points for messages where the sender is the same person" in {
      val instant1 = LocalDateTime.now()
      val instant2 = instant1.plusMinutes(10)
      val data = SocialData(
        "test",
        List(
          Conversation(
            false,
            "test",
            List("abc", "def"),
            List(
              ConversationMessage(3, instant1.toInstant(ZoneOffset.UTC).toEpochMilli(), Some("abc")),
              ConversationMessage(5, instant2.toInstant(ZoneOffset.UTC).toEpochMilli, Some("abc"))
            ),
            DonationDataSourceType.Facebook
          )
        )
      )

      service.produceGraphData(data)(DonationDataSourceType.Facebook).responseTimes shouldBe empty
    }

    "should only use the latest messages up to the sample size" in {
      val instant1 = LocalDateTime.now()
      val instant2 = instant1.plusMinutes(10)
      val instant3 = instant2.plusMinutes(10)
      val instant4 = instant3.plusMinutes(20)
      val data = SocialData(
        "test",
        List(
          Conversation(
            false,
            "test",
            List("abc", "def"),
            List(
              ConversationMessage(3, instant1.toInstant(ZoneOffset.UTC).toEpochMilli(), Some("abc")),
              ConversationMessage(5, instant2.toInstant(ZoneOffset.UTC).toEpochMilli, Some("def"))
            ),
            DonationDataSourceType.Facebook
          ),
          Conversation(
            false,
            "test2",
            List("abc", "ghi"),
            List(
              ConversationMessage(2, instant3.toInstant(ZoneOffset.UTC).toEpochMilli, Some("abc")),
              ConversationMessage(72, instant4.toInstant(ZoneOffset.UTC).toEpochMilli, Some("ghi"))
            ),
            DonationDataSourceType.Facebook
          )
        )
      )
      val smallSampleSizeService = createService(maxSampleSize = 2)

      smallSampleSizeService
        .produceGraphData(data)
        .values
        .flatMap(_.responseTimes) should contain theSameElementsAs List(
        AnswerTimePoint(60 * 20 * 1000, false, instant3.toInstant(ZoneOffset.UTC).toEpochMilli)
      )
    }
  }

  private def createService(responseTimeCutoff: Duration = 1.day, maxSampleSize: Int = 1000) =
    new MessageAnalysisService(new FeedbackConfig(responseTimeCutoff, maxSampleSize))
}

object MessageAnalysisServiceTest {
  case class TestCase(
    name: String,
    socialData: SocialData,
    expectedGraph: Map[DonationDataSourceType, (AverageNumberOfMessages, List[SentReceivedPoint])],
  )
  private val donorName = "donor"

  private lazy val testCases =
    List[TestCase](singleConvoSingleMonth, singleConvoMultipleMonths, multipleConvos, averageOverSingleYear)

  lazy val singleConvoSingleMonth: TestCase = {
    val conversation =
      createConversation(DonationDataSourceType.Facebook, (2017, 1, donorName), (2017, 1, "4"), (2017, 1, donorName))
    val socialData = SocialData(donorName, List(conversation))
    TestCase(
      "containing one conversation with three messages taking place in one month",
      socialData,
      Map(
        DonationDataSourceType.Facebook -> (AverageNumberOfMessages(2, 1, 1, 1, 2,
          1), List(SentReceivedPoint(2017, 1, 2, 1)))
      ),
    )
  }

  lazy val singleConvoMultipleMonths: TestCase = {
    val conversation = createConversation(
      DonationDataSourceType.Facebook,
      (2017, 1, donorName),
      (2018, 3, donorName),
      (2008, 12, "someone")
    )
    val socialData = SocialData(donorName, List(conversation))
    TestCase(
      "containing one conversation spanning multiple months",
      socialData,
      Map(
        DonationDataSourceType.Facebook -> (
          AverageNumberOfMessages(2, 1, 3, 3, 0, 0),
          List(
            SentReceivedPoint(2008, 12, 0, 1),
            SentReceivedPoint(2017, 1, 1, 0),
            SentReceivedPoint(2018, 3, 1, 0)
          )
        )
      )
    )
  }

  lazy val multipleConvos: TestCase = {
    val firstConversation = createConversation(DonationDataSourceType.Facebook, (2017, 1, donorName))
    val secondConversation =
      createConversation(DonationDataSourceType.WhatsApp, (2017, 1, "someone else"), (2017, 2, donorName))
    val socialData =
      SocialData(
        donorName,
        List(firstConversation, secondConversation)
      )
    TestCase(
      "containing two conversations from different sources",
      socialData,
      Map(
        DonationDataSourceType.Facebook -> (AverageNumberOfMessages(1, 0, 1, 1, 1,
          0), List(SentReceivedPoint(2017, 1, 1, 0))),
        DonationDataSourceType.WhatsApp -> (AverageNumberOfMessages(1, 1, 2, 1, 0,
          0), List(SentReceivedPoint(2017, 2, 1, 0), SentReceivedPoint(2017, 1, 0, 1)))
      )
    )
  }

  lazy val averageOverSingleYear: TestCase = {
    val conversations = (1 to 12).flatMap { month =>
      List(
        createConversation(DonationDataSourceType.Facebook, (2017, month, donorName), (2017, month, "other")),
        createConversation(DonationDataSourceType.Facebook, (2017, month, donorName))
      )
    }

    val socialData = SocialData(donorName, conversations.toList)
    TestCase(
      "containing multiple messages each month of a single year",
      socialData,
      Map(
        DonationDataSourceType.Facebook -> (AverageNumberOfMessages(24, 12, 12, 1, 2, 1),
        (1 to 12).map(month => SentReceivedPoint(2017, month, 2, 1)).toList)
      )
    )
  }

  private def createConversation(
    donationDataSourceType: DonationDataSourceType,
    messages: (Int, Int, String)*
  ): Conversation = {
    val parsedMessages = messages.map {
      case (year, month, donor) =>
        val timestamp = LocalDateTime.of(year, month, 1, 12, 0).toInstant(ZoneOffset.UTC).toEpochMilli
        ConversationMessage(15, timestamp, Some(donor))
    }.toList

    val participants = messages.map { case (_, _, sender) => sender }.distinct.toList

    Conversation(participants.lengthCompare(2) > 0, "123", participants, parsedMessages, donationDataSourceType)
  }

}
