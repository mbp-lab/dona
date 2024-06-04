package modules

import cats.data.EitherT
import cats.implicits._
import com.google.inject.{Inject, Injector, Provider}
import models.api.SocialData
import org.slf4j.LoggerFactory
import services.{FeatureFlagService, Features, RepositorySocialDataService, SocialDataService}

import scala.concurrent.{ExecutionContext, Future}

final class SocialDataServiceProvider @Inject()(isFeatureEnabled: FeatureFlagService, injector: Injector)(
  implicit ec: ExecutionContext
) extends Provider[SocialDataService] {

  private val logger = LoggerFactory.getLogger(this.getClass)

  override def get(): SocialDataService =
    if (isFeatureEnabled(Features.SocialDataStorage))
      injector.getInstance(classOf[RepositorySocialDataService])
    else
      (_: SocialData) =>
        EitherT {
          logger.warn("Social data storage has been disabled. No data will be saved.")
          Future.successful(Right((): Unit))
        }
}