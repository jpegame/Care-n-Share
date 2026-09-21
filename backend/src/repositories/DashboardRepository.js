import prisma from '../config/database.js';

class DashboardRepository {
  async getSummary(ongId) {
    const totalDonations = await prisma.donation.count({ where: { ongId } });
    const pendingDonations = await prisma.donation.count({ where: { ongId, status: 'PENDENTE' } });
    const completedDonations = await prisma.donation.count({ where: { ongId, status: 'CONCLUIDA' } });
    const activeGoals = await prisma.goal.count({ where: { ongId, status: 'ATIVA' } });

    return { totalDonations, pendingDonations, completedDonations, activeGoals };
  }

  async getDonationStats(ongId) {
    const total = await prisma.donation.count({ where: { ongId } });
    const completed = await prisma.donation.count({ where: { ongId, status: 'CONCLUIDA' } });
    const pending = await prisma.donation.count({ where: { ongId, status: 'PENDENTE' } });

    const byMonth = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'Mon') as month, 
        COUNT(*)::int as count 
      FROM "Doacao" 
      WHERE "ongId" = ${ongId} 
      GROUP BY month 
      ORDER BY MIN("createdAt") ASC
    `;

    return { total, completed, pending, byMonth };
  }

  async getGoalsProgress(ongId) {
    const goals = await prisma.goal.findMany({
      where: { ongId },
      select: {
        id: true,
        titulo: true,
        quantidadeAtual: true,
        metaNumerica: true
      }
    });

    return goals.map(goal => ({
      id: goal.id,
      title: goal.titulo,
      current: goal.quantidadeAtual,
      target: goal.metaNumerica,
      percentage: goal.metaNumerica > 0 ? Math.round((goal.quantidadeAtual / goal.metaNumerica) * 100) : 0
    }));
  }

  async getVolunteerStats(ongId) {
    const totalVolunteers = await prisma.donation.count({
      where: { ongId, contributionType: 'VOLUNTARIADO' }
    });

    const aggregateHours = await prisma.donation.aggregate({
      where: { ongId, contributionType: 'VOLUNTARIADO', status: 'CONCLUIDA' },
      _sum: { quantidade: true }
    });

    return {
      totalVolunteers,
      totalHours: aggregateHours._sum.quantidade || 0,
      hoursByMonth: []
    };
  }

  async getRecentActivity(ongId) {
    return await prisma.activity.findMany({
      where: { ongId },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new DashboardRepository();