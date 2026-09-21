import prisma from '../config/database.js';

class DonationRepository {
  async findAllByOng({ ongId, search, status, contributionType }) {
    const where = {
      ongId,
      ...(status && { status }),
      ...(contributionType && { contributionType }),
      ...(search && {
        donor: {
          nome: { contains: search, mode: 'insensitive' }
        }
      })
    };

    return await prisma.doacao.findMany({
      where,
      include: {
        donor: {
          select: { id: true, nome: true }
        },
        meta: {
          select: { id: true, titulo: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id, ongId) {
    return await prisma.doacao.findFirst({
      where: { id, ongId },
      include: {
        donor: {
          select: { id: true, nome: true }
        },
        meta: {
          select: { id: true, titulo: true }
        }
      }
    });
  }

  async completeDonation(donation) {
    const completedAt = new Date();

    return await prisma.$transaction(async (tx) => {
      const updatedDonation = await tx.doacao.update({
        where: { id: donation.id },
        data: {
          status: 'CONCLUIDA',
          completedAt
        }
      });

      if (donation.metaId) {
        await tx.meta.update({
          where: { id: donation.metaId },
          data: {
            quantidadeAtual: { increment: donation.quantidade }
          }
        });
      }

      await tx.notificacao.create({
        data: {
          usuarioId: donation.donorId,
          titulo: 'Doação Concluída',
          mensagem: 'Sua doação foi recebida com sucesso pela ONG!'
        }
      });

      return updatedDonation;
    });
  }

  async cancelDonation(id, reason) {
    return await prisma.doacao.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        motivoCancelamento: reason
      }
    });
  }
}

export default new DonationRepository();