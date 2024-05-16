package persistence

import models.domain.Reaction

import scala.concurrent.Future

trait ReactionRepository {
  def insertBatch(posts: Option[Seq[Reaction]]): Future[Unit]
}
