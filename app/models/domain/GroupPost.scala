package models.domain

import java.time.Instant
import java.util.UUID

import models.domain.DonationDataSourceType.DonationDataSourceType
import slick.lifted.MappedTo

case class GroupPost(
  id: GroupPostId,
  donationId: DonationId,
  donationDataSourceType: DonationDataSourceType,
  wordCount: Int,
  mediaCount: Int,
  timestamp: Instant,
)

case class GroupPostId(value: UUID) extends MappedTo[UUID]
object GroupPostId extends IdSupport[GroupPostId]