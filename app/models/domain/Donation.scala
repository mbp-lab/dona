package models.domain

import java.util.UUID

import play.api.libs.json.Format
import slick.jdbc.JdbcType
import slick.jdbc.PostgresProfile.api._
import scala.util.Random
// import models.domain.Conversation.ParticipantId

case class Donation(
  id: DonationId,
  externalDonorId: ExternalDonorId,
  donorId: Option[DonorId],
  status: DonationStatus,
)
object Donation {
  def tupled = Donation.apply.tupled
}

object DonationDataSourceType extends Enumeration(1) {
  type DonationDataSourceType = Value
  val Facebook, WhatsApp, Instagram, Multiple = Value

  implicit val jsonFormat: Format[DonationDataSourceType] = EnumFormat.format(DonationDataSourceType)
}

sealed trait DonationStatus {
  def toSqlString: String = this.toString.toLowerCase
}

object DonationStatus {
  case object NotStarted extends DonationStatus
  case object Pending extends DonationStatus
  case object Complete extends DonationStatus
  case object Deleted extends DonationStatus

  def apply(string: String): DonationStatus =
    unapply(string).getOrElse(throw new IllegalArgumentException(s"$string is not a valid donation status."))

  def unapply(string: String): Option[DonationStatus] = string.toLowerCase match {
    case "notstarted" => Some(NotStarted)
    case "pending"    => Some(Pending)
    case "complete"   => Some(Complete)
    case "deleted"    => Some(Deleted)
    case _            => None
  }
}

case class DonorId(value: UUID) {
  def asParticipant = ParticipantId(value)
}

object DonorId extends IdSupport[DonorId]{
  override def apply(uuid: UUID): DonorId = DonorId(uuid)
  implicit val donorIdColumnType: JdbcType[DonorId] = MappedColumnType.base[DonorId, UUID](
    donorId => donorId.value,
    uuid => DonorId(uuid)
  )
}

case class DonationId(value: UUID)
object DonationId extends IdSupport[DonationId]{
  override def apply(uuid: UUID): DonationId = DonationId(uuid)
  implicit val donationIdColumnType: JdbcType[DonationId] = MappedColumnType.base[DonationId, UUID](
    donationId => donationId.value,
    uuid => DonationId(uuid)
  )
}

case class ExternalDonorId(id: String) {
  override def toString: String = id
}

object ExternalDonorId {
  def generate(random: Random) = ExternalDonorId(random.alphanumeric.take(6).mkString("").toLowerCase)
}
