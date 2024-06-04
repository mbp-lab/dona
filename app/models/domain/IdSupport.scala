package models.domain

import java.util.UUID

trait IdSupport[T] {
  def generate: T = apply(UUID.randomUUID())

  def apply(uuid: UUID): T
}
