import donationRepository from '../repositories/DonationRepository.js';

class DonationController {
  async create(req, res) {
    try {
      const { quantity, contributionType, description, ongId, goalId } = req.body;
      const donorId = req.user.id;

      if (!quantity || !ongId) {
        return res.status(400).json({ error: 'Quantidade e ONG são obrigatórias.' });
      }

      const donation = await donationRepository.create({
        quantity: parseFloat(quantity),
        contributionType,
        description,
        donorId,
        ongId,
        goalId: goalId || null
      });

      return res.status(201).json(donation);
    } catch (error) {
      console.error('Erro ao criar doação:', error);
      return res.status(400).json({ error: 'Erro ao registrar doação.' });
    }
  }

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

  async update(req, res) {
    try {
      const { id } = req.params;
      const { quantity, description, contributionType, goalId } = req.body;
      const userId = req.user.id;

      const existingDonation = await donationRepository.findById(id);
      if (!existingDonation) {
        return res.status(404).json({ error: 'Doação não encontrada.' });
      }

      if (existingDonation.donorId !== userId && existingDonation.ongId !== userId) {
        return res.status(403).json({ error: 'Acesso negado para alterar esta doação.' });
      }

      if (existingDonation.status !== 'PENDENTE') {
        return res.status(400).json({ error: 'Apenas doações pendentes podem ser editadas.' });
      }

      const updatedDonation = await donationRepository.update(id, {
        ...(quantity && { quantity: parseFloat(quantity) }),
        ...(description !== undefined && { description }),
        ...(contributionType && { contributionType }),
        ...(goalId !== undefined && { goalId })
      });

      return res.status(200).json(updatedDonation);
    } catch (error) {
      console.error('Erro ao atualizar doação:', error);
      return res.status(400).json({ error: 'Erro ao atualizar doação' });
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

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const donation = await donationRepository.findById(id);
      if (!donation) {
        return res.status(404).json({ error: 'Doação não encontrada.' });
      }

      if (donation.donorId !== userId && donation.ongId !== userId) {
        return res.status(403).json({ error: 'Acesso negado para excluir esta doação.' });
      }

      await donationRepository.delete(id);
      return res.status(200).json({ message: 'Doação excluída com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar doação:', error);
      return res.status(400).json({ error: 'Erro ao deletar doação' });
    }
  }
}

export default new DonationController();