package services

import java.time.Instant

import models.api.{SocialData => ApiSocialData, Conversation => ApiConversation, Post => ApiPost, GroupPost => ApiGroupPost, Comment => ApiComment, GroupComment => ApiGroupComment, Reaction => ApiReaction}
import models.domain._

object SocialDataTransformer extends ((DonationId, ApiSocialData) => SocialDataDonation) {


  def apply(
    donationId: DonationId,
    socialData: ApiSocialData
  ): SocialDataDonation = {
    val donorId = DonorId.generate
    var mappedParticipantIds = Map(socialData.donorId -> donorId.asParticipant)
    var mappedConversationIds = Map[String, ConversationId]()

    def getParticipantId(id: String) = {
      mappedParticipantIds.get(id) match {
        case Some(participant) => participant
        case None =>
          val mappedId = ParticipantId.generate
          mappedParticipantIds = mappedParticipantIds.updated(id, mappedId)
          mappedId
      }
    }

    def getConversationId(id: String) = {
      mappedConversationIds.get(id) match {
        case Some(conversation) =>
          conversation
        case None =>
          val mappedId = ConversationId.generate
          mappedConversationIds = mappedConversationIds.updated(id, mappedId)
          mappedId
      }
    }

    def transformConversationMessages(conversation: ApiConversation) = {
      val conversationId = getConversationId(conversation.conversationId)
      conversation.messages.map { message =>
        import message._
        Message(
          MessageId.generate,
          conversationId,
          wordCount,
          sender.map(getParticipantId),
          Instant.ofEpochMilli(timestampMs)
        )
      }
    }

    def transformConversationMessagesAudio(conversation: ApiConversation) = {
      val conversationId = getConversationId(conversation.conversationId)
      conversation.messagesAudio.map { messageAudio =>
        import messageAudio._
        MessageAudio(
          MessageId.generate,
          conversationId,
          lengthSeconds,
          sender.map(getParticipantId),
          Instant.ofEpochMilli(timestampMs)
        )
      }
    }

    def transformConversationParticipants(conversation: ApiConversation) = {
      val conversationId = getConversationId(conversation.conversationId)
      conversation.participants.map(
        id => {
          ConversationParticipant(ConversationParticipantId.generate, conversationId, getParticipantId(id))
        }
      )
    }

    def transformConversation(conversation: ApiConversation) = {
      import conversation._
      Conversation(
        getConversationId(conversationId),
        donationId,
        isGroupConversation,
        donationDataSourceType
      )
    }

    def transformPost(post: ApiPost) = {
      import post._
      Post(
        PostId.generate,
        donationId,
        donationDataSourceType,
        wordCount,
        mediaCount,
        Instant.ofEpochMilli(timestampMs)
      )
    }

    def transformGroupPost(groupPost: ApiGroupPost) = {
      import groupPost._
      GroupPost(
        GroupPostId.generate,
        donationId,
        donationDataSourceType,
        wordCount,
        mediaCount,
        Instant.ofEpochMilli(timestampMs)
      )
    }

    def transformComment(comment: ApiComment) = {
      import comment._
      Comment(
        CommentId.generate,
        donationId,
        donationDataSourceType,
        wordCount,
        mediaCount,
        Instant.ofEpochMilli(timestampMs)
      )
    }

    def transformGroupComment(groupComment: ApiGroupComment) = {
      import groupComment._
      GroupComment(
        GroupCommentId.generate,
        donationId,
        donationDataSourceType,
        wordCount,
        mediaCount,
        Instant.ofEpochMilli(timestampMs)
      )
    }

    def transformReaction(reaction: ApiReaction) = {
      import reaction._
      Reaction(
        ReactionId.generate,
        donationId,
        donationDataSourceType,
        reactionType,
        Instant.ofEpochMilli(timestampMs)
      )
    }

    val conversations = socialData.conversations.map(conversation => transformConversation(conversation))
    val messages = socialData.conversations.flatMap(transformConversationMessages)
    val messagesAudio = socialData.conversations.flatMap(transformConversationMessagesAudio)
    val participants = socialData.conversations.flatMap(transformConversationParticipants)
    val posts = socialData.posts.map(_.map(post => transformPost(post)))
    val groupPosts = socialData.groupPosts.map(_.map(groupPosts => transformGroupPost(groupPosts)))
    val comments = socialData.comments.map(_.map(comment => transformComment(comment)))
    val groupComments = socialData.groupComments.map(_.map(groupComment => transformGroupComment(groupComment)))
    val reactions = socialData.reactions.map(_.map(reaction => transformReaction(reaction)))


    SocialDataDonation(donorId, conversations, messages, messagesAudio, participants, posts, groupPosts, comments, groupComments, reactions)
  }
}
