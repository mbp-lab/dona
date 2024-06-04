package services

import models.api.SocialData
import cats.data.EitherT
import cats.implicits._
import scala.concurrent.Future

trait SocialDataService {
  def saveData(socialData: SocialData): EitherT[Future, String, Unit]
}