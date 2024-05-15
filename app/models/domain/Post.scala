package models.domain

import java.time.Instant
import java.util.UUID

import models.domain.DonationDataSourceType.DonationDataSourceType
import slick.lifted.MappedTo

case class Post(
  id: PostId,
  donationId: DonationId,
  donationDataSourceType: DonationDataSourceType,
  wordCount: Int,
  mediaCount: Int,
  timestamp: Instant,
)

case class PostId(value: UUID) extends MappedTo[UUID]
object PostId extends IdSupport[PostId]