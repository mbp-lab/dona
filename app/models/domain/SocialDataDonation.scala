package models.domain

case class SocialDataDonation(
  donorId: DonorId,
  conversations: List[Conversation],
  messages: List[Message],
  messagesAudio: List[MessageAudio],
  participants: List[ConversationParticipant],
  posts: Option[List[Post]] = None,
  groupPosts: Option[List[GroupPost]] = None,
  comments: Option[List[Comment]] = None,
  groupComments: Option[List[GroupComment]] = None,
  reactions: Option[List[Reaction]] = None,
)
