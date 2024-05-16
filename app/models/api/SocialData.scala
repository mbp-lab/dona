package models.api

import play.api.libs.json.JsonNaming.SnakeCase
import play.api.libs.json.{Format, Json, JsonConfiguration}

case class SocialData(
  donorId: String,
  conversations: List[Conversation],
  posts: Option[List[Post]] = None,
  comments: Option[List[Comment]] = None,
  groupPosts: Option[List[GroupPost]] = None,
  groupComments: Option[List[GroupComment]] = None,
  reactions: Option[List[Reaction]] = None
)

object SocialData {
  implicit val config: JsonConfiguration = JsonConfiguration(SnakeCase)
  implicit val jsonFormat: Format[SocialData] = Json.format[SocialData]
}
