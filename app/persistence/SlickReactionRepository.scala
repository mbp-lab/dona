package persistence

import com.google.inject.Inject
import models.domain.DonationDataSourceType.DonationDataSourceType
import models.domain.{DonationDataSourceType, DonationId, Reaction, ReactionId}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.JdbcProfile

import java.sql.Timestamp
import java.time.Instant
import scala.concurrent.{ExecutionContext, Future}

final class SlickReactionRepository @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)(
  implicit ec: ExecutionContext
) extends HasDatabaseConfigProvider[JdbcProfile]
    with ReactionRepository {
  import profile.api._

  private val Reactions = TableQuery[ReactionTable]

  override def insertBatch(reactions: Option[Seq[Reaction]]): Future[Unit] = {
    reactions match {
      case Some(reactionSeq) => db.run(Reactions ++= reactionSeq).map(_ => ())
      case None => Future.successful(())
    }
  }

  implicit private val mappedColumnType =
    MappedColumnType.base[DonationDataSourceType, Int](_.id, DonationDataSourceType.apply)

  implicit val timeConversion = MappedColumnType.base[Instant, Timestamp](
    Timestamp.from,
    _.toInstant
  )

  private class ReactionTable(tag: Tag) extends Table[Reaction](tag, "reactions") {
    def id = column[ReactionId]("id", O.PrimaryKey)
    def donationId = column[DonationId]("donation_id")
    def dataSourceType = column[DonationDataSourceType]("data_source_id")
    def reactionType = column[String]("reaction_type")
    def timestamp = column[Instant]("datetime")

    override def * =
      (id, donationId, dataSourceType, reactionType, timestamp) <> ((Reaction.apply _).tupled, Reaction.unapply)
  }
}
