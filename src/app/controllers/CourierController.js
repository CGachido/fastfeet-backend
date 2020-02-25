import * as Yup from 'yup';

import { Op } from 'sequelize';
import Courier from '../models/Courier';
import File from '../models/File';

class CourierController {
  async index(req, res) {
    const { q = '' } = req.query;
    const { page = 1 } = req.query;

    const couriers = await Courier.findAll({
      where: {
        name: {
          [Op.iLike]: `%${q}%`,
        },
      },
      limit: 20,
      offset: (page - 1) * 20,
      order: ['name'],
    });

    return res.json(couriers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number(),
    });
    const { avatar_id } = req.body;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    if (avatar_id) {
      const avatarExists = await File.findByPk(avatar_id);

      if (!avatarExists) {
        return res.status(400).json({ error: 'Foto não encontrada' });
      }
    }

    const courierExists = await Courier.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (courierExists) {
      return res.status(400).json({ error: 'Entregador já cadastrado' });
    }

    const { id, name } = await Courier.create(req.body);

    return res.json({ id, name });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const { email } = req.body;
    const courier = await Courier.findByPk(req.params.courierId);

    if (!courier) {
      return res.status(400).json({ error: 'Entregador não encontrado' });
    }

    if (email && email !== courier.email) {
      const courierExists = await Courier.findOne({
        where: {
          email,
        },
      });

      if (courierExists) {
        return res.status(400).json({ error: 'Entregador já cadastrado' });
      }
    }

    const { id, name } = await courier.update(req.body);

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const { courierId } = req.params;
    const courier = await Courier.findByPk(courierId);

    if (!courier) {
      return res.status(400).json({ error: 'Entregador não encontrado' });
    }

    await courier.destroy();

    return res.json();
  }
}

export default new CourierController();
