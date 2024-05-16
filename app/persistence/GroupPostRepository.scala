package persistence

import models.domain.GroupPost

import scala.concurrent.Future

trait GroupPostRepository {
  def insertBatch(groupPosts: Option[Seq[GroupPost]]): Future[Unit]
}
