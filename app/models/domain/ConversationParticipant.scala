package models.domain

import java.util.UUID
import slick.jdbc.JdbcType
import slick.jdbc.PostgresProfile.api._
// import models.domain.{ConversationId, ParticipantId}

// separate ID is necessary because FB data results in a single "placeholder" user representing all deleted accounts
// this means the same "user" can be participating in a group conversation multiple times
case class ConversationParticipant(
  id: ConversationParticipantId,
  conversationId: ConversationId,
  participantId: ParticipantId,
  participantPseudonym: String
)

object ConversationParticipant {
  def tupled: ((ConversationParticipantId, ConversationId, ParticipantId, String)) => ConversationParticipant =
    ConversationParticipant.apply.tupled
}

case class ConversationParticipantId(value: UUID)
object ConversationParticipantId extends IdSupport[ConversationParticipantId] {
  override def apply(uuid: UUID): ConversationParticipantId = ConversationParticipantId(uuid)
  implicit val conversationParticipantIdColumnType: JdbcType[ConversationParticipantId] = MappedColumnType.base[ConversationParticipantId, UUID](
    conversationParticipantId => conversationParticipantId.value,
    uuid => ConversationParticipantId(uuid)
  )
}
