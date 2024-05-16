package models.domain

import java.time.Instant
import java.util.UUID

import models.domain.DonationDataSourceType.DonationDataSourceType
import slick.lifted.MappedTo

case class Reaction(
  id: ReactionId,
  donationId: DonationId,
  donationDataSourceType: DonationDataSourceType,
  reactionType: String,
  timestamp: Instant,
)

case class ReactionId(value: UUID) extends MappedTo[UUID]
object ReactionId extends IdSupport[ReactionId]