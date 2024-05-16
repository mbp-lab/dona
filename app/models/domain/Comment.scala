package models.domain

import java.time.Instant
import java.util.UUID

import models.domain.DonationDataSourceType.DonationDataSourceType
import slick.lifted.MappedTo

case class Comment(
  id: CommentId,
  donationId: DonationId,
  donationDataSourceType: DonationDataSourceType,
  wordCount: Int,
  mediaCount: Int,
  timestamp: Instant,
)

case class CommentId(value: UUID) extends MappedTo[UUID]
object CommentId extends IdSupport[CommentId]