package persistence

import models.domain._
import org.mockito.ArgumentMatchers.{eq => isEqual, _}
import org.mockito.Mockito._
import org.scalatest.freespec.AsyncFreeSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

import scala.concurrent.Future

final class IdVerifyingDonationServiceSpec extends AsyncFreeSpec with Matchers with MockitoSugar {

  "Creating a new donor" - {
    "should generate a new short donor ID and save a pending donation" in {
      val (service, repository) = systemUnderTest()
      when(repository.insert(any[Donation])).thenReturn(Future.successful(Right(())))

      service.beginOnlineConsentDonation().map { id =>
        verify(repository).insert(isEqual(Donation(any[DonationId], id, None, DonationStatus.Pending)))
        id shouldBe donorIds.head
      }
    }

    "should keep generating donor IDs until it finds an unused one" in {
      val last = donorIds.last
      val repository = new DonationRepository {
        override def insert(donation: Donation): Future[Either[DuplicateDonorIdFailure, Unit]] = {
          if (donation.externalDonorId == last)
            Future.successful(Right(()))
          else
            Future.successful(Left(DuplicateDonorIdFailure(donation.externalDonorId)))
        }

        override def update(donation: Donation): Future[Unit] = ???

        override def getByDonor(donorId: ExternalDonorId): Future[Option[Donation]] = ???
      }
      val (service, _) = systemUnderTest(Some(repository))

      service.beginOnlineConsentDonation().map { id =>
        id shouldBe last
      }
    }
  }

  private val donorIds = List("donor1", "donor2", "donor3", "donor4", "donor5").map(ExternalDonorId.apply)

  def systemUnderTest(
    repository: Option[DonationRepository] = None
  ): (IdVerifyingDonationService, DonationRepository) = {
    val iterator = donorIds.iterator
    val generateDonorId = () => iterator.next()
    val dao = repository.getOrElse(mock[DonationRepository])
    val service = new IdVerifyingDonationService(dao, generateDonorId)
    (service, dao)
  }
}
