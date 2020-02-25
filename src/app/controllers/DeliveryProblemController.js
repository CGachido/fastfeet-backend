import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Courier from '../models/Courier';
import CancelOrderMail from '../jobs/CancelOrderMail';

import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const problems = await DeliveryProblem.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      order: ['created_at'],
    });

    return res.json(problems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });
    const { description } = req.body;
    const { orderId } = req.params;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const orderExists = await Order.findByPk(orderId);

    if (!orderExists) {
      return res.status(400).json({ error: 'Encomenda não encontrada' });
    }

    const problem = await DeliveryProblem.create({
      order_id: orderId,
      description,
    });

    return res.json(problem);
  }

  async delete(req, res) {
    const { problemId } = req.params;
    const problem = await DeliveryProblem.findByPk(problemId);

    if (!problem) {
      return res.status(400).json({ error: 'Problema não encontrado' });
    }

    const order = await Order.findByPk(problem.order_id, {
      include: [
        {
          model: Courier,
          as: 'courier',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (order.canceled_at) {
      return res.status(400).json({ error: 'Encomenda já cancelada' });
    }

    order.canceled_at = new Date();
    order.save();

    await Queue.add(CancelOrderMail.key, {
      courier: order.courier,
      canceled_at: order.canceled_at,
      id: order.id,
    });

    return res.json();
  }
}

export default new DeliveryProblemController();
