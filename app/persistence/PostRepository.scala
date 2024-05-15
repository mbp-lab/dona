package persistence

import models.domain.Post

import scala.concurrent.Future

trait PostRepository {
  def insertBatch(posts: Option[Seq[Post]]): Future[Unit]
}
