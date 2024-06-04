package controllers

import play.api.data.Form
import play.api.data.Forms._
import play.api.data.validation.Constraints._

object SocialDataForm {
  case class SocialFormData(inputJson: String)

  object SocialFormData {
    def apply(inputJson: String): SocialFormData = new SocialFormData(inputJson)
    def unapply(arg: SocialFormData): Option[String] = Some(arg.inputJson)
  }

  val socialDataForm: Form[SocialFormData] = Form(
    mapping(
      "inputJson" -> nonEmptyText
    )(SocialFormData.apply)(SocialFormData.unapply)
  )
}
