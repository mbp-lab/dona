package persistence

import models.domain.GroupComment

import scala.concurrent.Future

trait GroupCommentRepository {
  def insertBatch(posts: Option[Seq[GroupComment]]): Future[Unit]
}
