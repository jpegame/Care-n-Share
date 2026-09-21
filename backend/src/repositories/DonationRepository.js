import prisma from '../config/database.js';

class DonationRepository {
  async create(data) {
    return await prisma.donation.create({
      data,
      include: {
        donor: { select: { id: true, name: true, email: true } },
        ong: { select: { id: true, name: true, email: true } },
        goal: { select: { id: true, title: true } }
      }
    });
  }

  async update(id, data) {
    return await prisma.donation.update({
      where: { id },
      data,
      include: {
        donor: { select: { id: true, name: true, email: true } },
        goal: { select: { id: true, title: true } }
      }
    });
  }

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

    return await prisma.donation.findMany({
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
    return await prisma.donation.findFirst({
      where: { id, ongId },
      include: {
        donor: {
          select: { id: true, name: true }
        },
        goal: {
          select: { id: true, title: true }
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
    return await prisma.donation.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        cancelReason: reason
      }
    });
  }

  async delete(id) {
    return await prisma.donation.delete({
      where: { id }
    });
  }
}

export default new DonationRepository();