import * as Yup from 'yup';
import { Op } from 'sequelize';
import { parseISO, isAfter, isBefore, addDays } from 'date-fns';
import Order from '../models/Order';
import File from '../models/File';

class DeliveryOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { courierId } = req.params;

    const orders = await Order.findAll({
      where: {
        courier_id: courierId,
        end_at: {
          [Op.not]: null,
        },
      },
      limit: 20,
      offset: (page - 1) * 20,
      order: ['created_at'],
    });

    return res.json(orders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      end_at: Yup.date().required(),
    });

    const { end_at } = req.body;
    const { courierId, orderId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'É necessário enviar a assinatura' });
    }

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(400).json({
        error: 'Encomenda não encontrada',
      });
    }

    if (order.end_at) {
      return res.status(400).json({
        error: 'Encomenda já consta como entregue',
      });
    }

    if (!order.start_at) {
      return res.status(400).json({
        error: 'Encomenda não consta como retirada',
      });
    }

    if (parseInt(courierId, 0) !== parseInt(order.courier_id, 0)) {
      return res.status(400).json({
        error: 'Somente o próprio entregador pode entregar a encomenda',
      });
    }

    if (end_at) {
      const parsedStartAt = order.start_at;
      const parsedEndAt = parseISO(end_at);
      if (isBefore(parsedEndAt, parsedStartAt)) {
        return res.status(400).json({
          error: 'Data de entrega não deve ser inferior a data de retirada.',
        });
      }

      if (isAfter(parsedEndAt, addDays(new Date(), 1))) {
        return res.status(400).json({
          error: 'Data de entrega não pode ser futura.',
        });
      }
    } else {
      return res.status(400).json({
        error:
          'Não é permitido cadastrar a data de entrega sem a data de retirada.',
      });
    }

    const { originalname: name, filename: path } = req.file;
    const file = await File.create(
      {
        name,
        path,
      },
      { new: true }
    );
    await order.update({ end_at, signature_id: file.id });

    return res.json(order);
  }
}

export default new DeliveryOrderController();
