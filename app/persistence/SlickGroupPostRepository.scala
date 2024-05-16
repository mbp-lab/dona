package persistence

import com.google.inject.Inject
import models.domain.DonationDataSourceType.DonationDataSourceType
import models.domain.{DonationDataSourceType, DonationId, GroupPost, GroupPostId}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.JdbcProfile

import java.sql.Timestamp
import java.time.Instant
import scala.concurrent.{ExecutionContext, Future}

final class SlickGroupPostRepository @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)(
  implicit ec: ExecutionContext
) extends HasDatabaseConfigProvider[JdbcProfile]
    with GroupPostRepository {
  import profile.api._

  private val GroupPosts = TableQuery[GroupPostTable]

  override def insertBatch(groupPosts: Option[Seq[GroupPost]]): Future[Unit] = {
    groupPosts match {
      case Some(groupPostSeq) => db.run(GroupPosts ++= groupPostSeq).map(_ => ())
      case None => Future.successful(())
    }
  }

  implicit private val mappedColumnType =
    MappedColumnType.base[DonationDataSourceType, Int](_.id, DonationDataSourceType.apply)

  implicit val timeConversion = MappedColumnType.base[Instant, Timestamp](
    Timestamp.from,
    _.toInstant
  )

  private class GroupPostTable(tag: Tag) extends Table[GroupPost](tag, "group_posts") {
    def id = column[GroupPostId]("id", O.PrimaryKey)
    def donationId = column[DonationId]("donation_id")
    def dataSourceType = column[DonationDataSourceType]("data_source_id")
    def wordCount = column[Int]("word_count")
    def mediaCount = column[Int]("media_count")
    def timestamp = column[Instant]("datetime")

    override def * =
      (id, donationId, dataSourceType, wordCount, mediaCount, timestamp) <> ((GroupPost.apply _).tupled, GroupPost.unapply)
  }
}
