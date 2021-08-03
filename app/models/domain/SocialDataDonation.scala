package models.domain

case class SocialDataDonation(
  donorId: DonorId,
  conversations: List[Conversation],
  messages: List[Message],
  participants: List[ConversationParticipant]
)
