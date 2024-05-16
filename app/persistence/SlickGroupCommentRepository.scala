package persistence

import com.google.inject.Inject
import models.domain.DonationDataSourceType.DonationDataSourceType
import models.domain.{DonationDataSourceType, DonationId, GroupComment, GroupCommentId}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.JdbcProfile

import java.sql.Timestamp
import java.time.Instant
import scala.concurrent.{ExecutionContext, Future}

final class SlickGroupCommentRepository @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)(
  implicit ec: ExecutionContext
) extends HasDatabaseConfigProvider[JdbcProfile]
    with GroupCommentRepository {
  import profile.api._

  private val GroupComments = TableQuery[GroupCommentTable]

  override def insertBatch(groupComments: Option[Seq[GroupComment]]): Future[Unit] = {
    groupComments match {
      case Some(groupCommentSeq) => db.run(GroupComments ++= groupCommentSeq).map(_ => ())
      case None => Future.successful(())
    }
  }

  implicit private val mappedColumnType =
    MappedColumnType.base[DonationDataSourceType, Int](_.id, DonationDataSourceType.apply)

  implicit val timeConversion = MappedColumnType.base[Instant, Timestamp](
    Timestamp.from,
    _.toInstant
  )

  private class GroupCommentTable(tag: Tag) extends Table[GroupComment](tag, "group_comments") {
    def id = column[GroupCommentId]("id", O.PrimaryKey)
    def donationId = column[DonationId]("donation_id")
    def dataSourceType = column[DonationDataSourceType]("data_source_id")
    def wordCount = column[Int]("word_count")
    def mediaCount = column[Int]("media_count")
    def timestamp = column[Instant]("datetime")

    override def * =
      (id, donationId, dataSourceType, wordCount, mediaCount, timestamp) <> ((GroupComment.apply _).tupled, GroupComment.unapply)
  }
}
