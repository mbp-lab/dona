package persistence

import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

import com.google.inject.Inject
import models.domain.{ConversationId, Message, MessageId, ParticipantId}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.JdbcProfile
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.{ExecutionContext, Future}

final class SlickMessageRepository @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)(
  implicit ec: ExecutionContext
) extends HasDatabaseConfigProvider[JdbcProfile]
    with MessageRepository {
  import profile.api._

  private val Messages = TableQuery[MessagesTable]
  override def insertBatch(message: Seq[Message]): Future[Unit] = {
    db.run(Messages ++= message).map(_ => ())
  }

  implicit val instantColumnType: BaseColumnType[Instant] = MappedColumnType.base[Instant, Timestamp](
    Timestamp.from,
    _.toInstant
  )

  implicit val uuidColumnType: BaseColumnType[UUID] = MappedColumnType.base[UUID, String](
    _.toString,
    UUID.fromString
  )

  private class MessagesTable(tag: Tag) extends Table[Message](tag, "messages") {
    def id = column[MessageId]("id", O.PrimaryKey)
    def conversationId = column[ConversationId]("conversation_id")
    def wordCount = column[Int]("word_count")
    def sender = column[Option[ParticipantId]]("sender_id")
    def timestamp = column[Instant]("datetime")

    override def * = (id, conversationId, wordCount, sender, timestamp) <> (Message.tupled, Message.unapply)
  }
}
