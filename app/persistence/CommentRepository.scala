package persistence

import models.domain.Comment

import scala.concurrent.Future

trait CommentRepository {
  def insertBatch(posts: Option[Seq[Comment]]): Future[Unit]
}
