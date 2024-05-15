package persistence

import com.google.inject.Inject
import models.domain.DonationDataSourceType.DonationDataSourceType
import models.domain.{Post, PostId, DonationDataSourceType, DonationId}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.jdbc.JdbcProfile
import java.sql.Timestamp
import java.time.Instant

import scala.concurrent.{ExecutionContext, Future}

final class SlickPostRepository @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)(
  implicit ec: ExecutionContext
) extends HasDatabaseConfigProvider[JdbcProfile]
    with PostRepository {
  import profile.api._

  private val Posts = TableQuery[PostTable]

  override def insertBatch(posts: Option[Seq[Post]]): Future[Unit] = {
    posts match {
      case Some(postSeq) => db.run(Posts ++= postSeq).map(_ => ())
      case None => Future.successful(())
    }
  }

  implicit private val mappedColumnType =
    MappedColumnType.base[DonationDataSourceType, Int](_.id, DonationDataSourceType.apply)

  implicit val timeConversion = MappedColumnType.base[Instant, Timestamp](
    Timestamp.from,
    _.toInstant
  )

  private class PostTable(tag: Tag) extends Table[Post](tag, "posts") {
    def id = column[PostId]("id", O.PrimaryKey)
    def donationId = column[DonationId]("donation_id")
    def dataSourceType = column[DonationDataSourceType]("data_source_id")
    def wordCount = column[Int]("word_count")
    def mediaCount = column[Int]("media_count")
    def timestamp = column[Instant]("datetime")

    override def * =
      (id, donationId, dataSourceType, wordCount, mediaCount, timestamp) <> ((Post.apply _).tupled, Post.unapply)
  }
}
