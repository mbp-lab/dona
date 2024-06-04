package models

import play.api.libs.json._

import scala.language.implicitConversions

package object domain {

  /**
    * JSON formatter for enumerations.
    */
  object EnumFormat {

    implicit def format(en: Enumeration): Format[en.Value] = {
      Format(reads(en), writes(en))
    }

    def reads(en: Enumeration): Reads[en.Value] = {
      case JsString(s) =>
        try {
          JsSuccess(en.withName(s))
        } catch {
          case _: NoSuchElementException =>
            JsError(
              s"Enumeration expected of type: '${en.getClass}', but it does not appear to contain the value: '$s'"
            )
        }
      case _ => JsError("String value expected")
    }

    implicit def writes(en: Enumeration): Writes[en.Value] = (v: en.Value) => JsString(v.toString)
  }
}
