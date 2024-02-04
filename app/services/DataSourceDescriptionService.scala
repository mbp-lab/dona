package services

import java.net.URI

import models.domain.DataSourceDescription.{AnimatedImage, ParsingDetails}
import models.domain.{DataSourceDescription, DonationDataSourceType}
import play.api.i18n.Messages

trait DataSourceDescriptionService {

  def listAll(implicit messages: Messages): List[DataSourceDescription]

}

final class InMemoryDataSourceDescriptionService() extends DataSourceDescriptionService {

  override def listAll(implicit messages: Messages): List[DataSourceDescription] =
    InMemoryDataSourceDescriptionService.dataDownloadInstructions

}

object InMemoryDataSourceDescriptionService {

  private def dataDownloadInstructions(implicit messages: Messages) = List(
    DataSourceDescription(
      name = DonationDataSourceType.Facebook,
      description = messages("facebook.description_html"),
      parsingDetails = ParsingDetails(script = "", specificFileExtensionAccepted = Some(".zip")),
      animation = Some(AnimatedImage(messages("facebook.instruction.gif"), 600, 840)),
      illustration = None,
      documentation = messages("facebook.external-documentation_html"),
      dataDownloadSteps = List(
        messages("facebook.donation-procedure.1"),
        messages("facebook.donation-procedure.2"),
        messages("facebook.donation-procedure.3"),
        messages("facebook.donation-procedure.4"),
        messages("facebook.donation-procedure.5"),
        messages("facebook.donation-procedure.6"),
        messages("facebook.donation-procedure.7"),
        messages("facebook.donation-procedure.8"),
        messages("facebook.donation-procedure.9"),
        messages("facebook.donation-procedure.10")
      ),
      logo = Some(messages("facebook.logo")),
      requiresAlias = false
    )
  )
}
