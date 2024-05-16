package models.domain

import java.time.Instant
import java.util.UUID

import models.domain.DonationDataSourceType.DonationDataSourceType
import slick.lifted.MappedTo

case class GroupComment(
  id: GroupCommentId,
  donationId: DonationId,
  donationDataSourceType: DonationDataSourceType,
  wordCount: Int,
  mediaCount: Int,
  timestamp: Instant,
)

case class GroupCommentId(value: UUID) extends MappedTo[UUID]
object GroupCommentId extends IdSupport[GroupCommentId]