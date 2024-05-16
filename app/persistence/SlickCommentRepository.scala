package persistence

import com.google.inject.Inject
import models.domain.DonationDataSourceType.DonationDataSourceType
import models.domain.{DonationDataSourceType, DonationId, Comment, CommentId}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.JdbcProfile

import java.sql.Timestamp
import java.time.Instant
import scala.concurrent.{ExecutionContext, Future}

final class SlickCommentRepository @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)(
  implicit ec: ExecutionContext
) extends HasDatabaseConfigProvider[JdbcProfile]
    with CommentRepository {
  import profile.api._

  private val Comments = TableQuery[CommentTable]

  override def insertBatch(comments: Option[Seq[Comment]]): Future[Unit] = {
    comments match {
      case Some(commentSeq) => db.run(Comments ++= commentSeq).map(_ => ())
      case None => Future.successful(())
    }
  }

  implicit private val mappedColumnType =
    MappedColumnType.base[DonationDataSourceType, Int](_.id, DonationDataSourceType.apply)

  implicit val timeConversion = MappedColumnType.base[Instant, Timestamp](
    Timestamp.from,
    _.toInstant
  )

  private class CommentTable(tag: Tag) extends Table[Comment](tag, "comments") {
    def id = column[CommentId]("id", O.PrimaryKey)
    def donationId = column[DonationId]("donation_id")
    def dataSourceType = column[DonationDataSourceType]("data_source_id")
    def wordCount = column[Int]("word_count")
    def mediaCount = column[Int]("media_count")
    def timestamp = column[Instant]("datetime")

    override def * =
      (id, donationId, dataSourceType, wordCount, mediaCount, timestamp) <> ((Comment.apply _).tupled, Comment.unapply)
  }
}
