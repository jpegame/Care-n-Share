import dashboardRepository from '../repositories/DashboardRepository.js';

class DashboardController {
  async getSummary(req, res) {
    try {
      const ongId = req.user.id;
      const summary = await dashboardRepository.getSummary(ongId);
      return res.status(200).json(summary);
    } catch (error) {
      console.error('Erro ao buscar resumo do dashboard:', error);
      return res.status(400).json({ error: 'Erro ao carregar resumo do dashboard' });
    }
  }

  async getDonationStats(req, res) {
    try {
      const ongId = req.user.id;
      const stats = await dashboardRepository.getDonationStats(ongId);
      return res.status(200).json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de doações:', error);
      return res.status(400).json({ error: 'Erro ao carregar estatísticas de doações' });
    }
  }

  async getGoalsProgress(req, res) {
    try {
      const ongId = req.user.id;
      const goals = await dashboardRepository.getGoalsProgress(ongId);
      return res.status(200).json(goals);
    } catch (error) {
      console.error('Erro ao buscar progresso das metas:', error);
      return res.status(400).json({ error: 'Erro ao carregar metas' });
    }
  }

  async getVolunteerStats(req, res) {
    try {
      const ongId = req.user.id;
      const volunteers = await dashboardRepository.getVolunteerStats(ongId);
      return res.status(200).json(volunteers);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de voluntariado:', error);
      return res.status(400).json({ error: 'Erro ao carregar voluntários' });
    }
  }

  async getRecentActivity(req, res) {
    try {
      const ongId = req.user.id;
      const activities = await dashboardRepository.getRecentActivity(ongId);
      return res.status(200).json(activities);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return res.status(400).json({ error: 'Erro ao carregar atividades recentes' });
    }
  }
}

export default new DashboardController();