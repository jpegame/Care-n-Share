import donationRepository from '../repositories/DonationRepository.js';

class DonationController {
  async getAll(req, res) {
    try {
      const ongId = req.user.id;
      const { search, status, contributionType } = req.query;

      const donations = await donationRepository.findAllByOng({
        ongId,
        search,
        status,
        contributionType
      });

      return res.status(200).json(donations);
    } catch (error) {
      console.error('Erro ao listar doações:', error);
      return res.status(400).json({ error: 'Erro ao buscar doações' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const ongId = req.user.id;

      const donation = await donationRepository.findById(id, ongId);
      if (!donation) {
        return res.status(404).json({ error: 'Doação não encontrada.' });
      }

      return res.status(200).json(donation);
    } catch (error) {
      console.error('Erro ao buscar detalhes da doação:', error);
      return res.status(400).json({ error: 'Erro ao carregar detalhes da doação' });
    }
  }

  async complete(req, res) {
    try {
      const { id } = req.params;
      const ongId = req.user.id;

      const donation = await donationRepository.findById(id, ongId);
      if (!donation) {
        return res.status(404).json({ error: 'Doação não encontrada ou acesso negado.' });
      }

      if (donation.status !== 'PENDENTE') {
        return res.status(400).json({ error: 'Apenas doações pendentes podem ser concluídas.' });
      }

      const updatedDonation = await donationRepository.completeDonation(donation);
      return res.status(200).json(updatedDonation);
    } catch (error) {
      console.error('Erro ao concluir doação:', error);
      return res.status(400).json({ error: 'Erro ao confirmar recebimento da doação' });
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const ongId = req.user.id;

      const donation = await donationRepository.findById(id, ongId);
      if (!donation) {
        return res.status(404).json({ error: 'Doação não encontrada ou acesso negado.' });
      }

      const canceledDonation = await donationRepository.cancelDonation(id, reason);
      return res.status(200).json(canceledDonation);
    } catch (error) {
      console.error('Erro ao cancelar doação:', error);
      return res.status(400).json({ error: 'Erro ao cancelar doação' });
    }
  }
}

export default new DonationController();