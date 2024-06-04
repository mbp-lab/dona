package models.domain

import java.time.Instant
import java.util.UUID

import models.domain.DonationDataSourceType.DonationDataSourceType
import slick.jdbc.JdbcType
import slick.jdbc.PostgresProfile.api._

case class Conversation(
  id: ConversationId,
  donationId: DonationId,
  isGroupConversation: Boolean,
  donationDataSourceType: DonationDataSourceType,
  conversationPseudonym: String
)
object Conversation {
  def tupled = Conversation.apply.tupled
}

case class ConversationId(value: UUID)
object ConversationId extends IdSupport[ConversationId] {
  override def apply(uuid: UUID): ConversationId = ConversationId(uuid)
  implicit val conversationIdColumnType: JdbcType[ConversationId] = MappedColumnType.base[ConversationId, UUID](
    conversationId => conversationId.value,
    uuid => ConversationId(uuid)
  )
}

case class ParticipantId(value: UUID)
object ParticipantId extends IdSupport[ParticipantId] {
  override def apply(uuid: UUID): ParticipantId = ParticipantId(uuid)
  implicit val participantIdColumnType: JdbcType[ParticipantId] = MappedColumnType.base[ParticipantId, UUID](
    participantId => participantId.value,
    uuid => ParticipantId(uuid)
  )
}

case class Message(
  id: MessageId,
  conversationId: ConversationId,
  wordCount: Int,
  sender: Option[ParticipantId],
  timestamp: Instant
)
object Message {
  def tupled = Message.apply.tupled
}

case class MessageAudio(
  id: MessageId,
  conversationId: ConversationId,
  lengthSeconds: Int,
  sender: Option[ParticipantId],
  timestamp: Instant
)
object MessageAudio {
  def tupled = MessageAudio.apply.tupled
}

case class MessageId(value: UUID)
object MessageId extends IdSupport[MessageId] {
  override def apply(uuid: UUID): MessageId = MessageId(uuid)
  implicit val messageIdColumnType: JdbcType[MessageId] = MappedColumnType.base[MessageId, UUID](
    messageId => messageId.value,
    uuid => MessageId(uuid)
  )
}
