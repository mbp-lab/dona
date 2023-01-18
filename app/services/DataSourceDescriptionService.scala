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
      name = DonationDataSourceType.WhatsApp,
      description = messages("whatsapp.description_html"),
      parsingDetails = ParsingDetails(script = "", specificFileExtensionAccepted = Some(".txt")),
      animation = Some(AnimatedImage(messages("whatsapp.instruction.gif"), 555, 270)),
      illustration = None,
      documentation = messages("whatsapp.external-documentation_html"),
      dataDownloadSteps = List(
        messages("whatsapp.donation-procedure.1"),
        messages("whatsapp.donation-procedure.2"),
        messages("whatsapp.donation-procedure.3"),
        messages("whatsapp.donation-procedure.4"),
        messages("whatsapp.donation-procedure.5"),
        messages("whatsapp.donation-procedure.6"),
        messages("whatsapp.donation-procedure.7"),
        messages("whatsapp.donation-procedure.8"),
      ),
      logo = Some(URI.create("https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"))
    ),
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
        messages("facebook.donation-procedure.8")
      ),
      logo = Some(
        URI
          .create("https://en.facebookbrand.com/wp-content/themes/fb-branding/release/static/media/f-logo.a2b1d8d6.svg")
      ),
      requiresAlias = false
    )
  )
}
