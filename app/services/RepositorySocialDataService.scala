package services

import cats.data.{EitherT, OptionT}
import cats.implicits._
import com.google.inject.Inject
import models.api.SocialData
import models.domain.{DonationStatus, ExternalDonorId, SocialDataDonation}
import persistence.{ConversationParticipantRepository, ConversationRepository, DonationRepository, MessageAudioRepository, MessageRepository}
import scala.concurrent.{ExecutionContext, Future}

final class RepositorySocialDataService @Inject()(
                                                   donationRepository: DonationRepository,
                                                   conversationRepository: ConversationRepository,
                                                   messageRepository: MessageRepository,
                                                   messageAudioRepository: MessageAudioRepository,
                                                   participantRepository: ConversationParticipantRepository
                                                 )(implicit ec: ExecutionContext)
  extends SocialDataService {

  override def saveData(socialData: SocialData): EitherT[Future, String, Unit] = {
    val externalDonorId = ExternalDonorId(socialData.donorId)
    for {
      donation <- OptionT(donationRepository.getByDonor(externalDonorId))
        .toRight(s"No donation for donor ID $externalDonorId present.")
      SocialDataDonation(internalDonorId, conversations, messages, messagesAudio, participants) = SocialDataTransformer(
        donation.id,
        socialData
      )
      newDonation = donation.copy(donorId = Some(internalDonorId), status = DonationStatus.Complete)
      _ <- EitherT.right(conversationRepository.insertBatch(conversations))
      _ <- EitherT.right(messageRepository.insertBatch(messages))
      _ <- EitherT.right(messageAudioRepository.insertBatch(messagesAudio))
      _ <- EitherT.right(participantRepository.insertBatch(participants))
      _ <- EitherT.right(donationRepository.update(newDonation))
    } yield ()
  }
}
