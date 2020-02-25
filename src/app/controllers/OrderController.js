import * as Yup from 'yup';
import {
  parseISO,
  format,
  isWithinInterval,
  isBefore,
  isAfter,
  addDays,
} from 'date-fns';

import OrderMail from '../jobs/OrderMail';
import Order from '../models/Order';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';

import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const orders = await Order.findAll({
      where: {
        canceled_at: null,
      },
      limit: 10,
      offset: (page - 1) * 10,
      order: ['created_at'],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      courier_id: Yup.number().required(),
      product: Yup.string().required(),
      signature_id: Yup.number(),
      start_at: Yup.date(),
      end_at: Yup.date(),
      canceled_at: Yup.date(),
    });

    const { recipient_id, courier_id, start_at, end_at } = req.body;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    if (start_at) {
      const parsedStartAt = parseISO(start_at);
      if (
        !isWithinInterval(parsedStartAt, {
          start: parseISO(format(parsedStartAt, "yyyy-MM-dd'T'08:00:00-03:00")),
          end: parseISO(format(parsedStartAt, "yyyy-MM-dd'T'18:00:00-03:00")),
        })
      ) {
        return res
          .status(400)
          .json({ error: 'Horário de entrega não permitido' });
      }
    }

    if (end_at) {
      const parsedEndAt = parseISO(end_at);

      if (start_at) {
        const parsedStartAt = parseISO(start_at);
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
    }

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Destinatário não encontrado' });
    }

    const courierExists = await Courier.findByPk(courier_id);

    if (!courierExists) {
      return res.status(400).json({ error: 'Entregador não encontrado' });
    }

    const order = await Order.create(req.body);

    await Queue.add(OrderMail.key, {
      courier: courierExists,
      created_at: order.createdAt,
      product: order.product,
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      courier_id: Yup.number(),
      product: Yup.string(),
      signature_id: Yup.number(),
      start_at: Yup.date(),
      end_at: Yup.date(),
      canceled_at: Yup.date(),
    });

    const { recipient_id, courier_id, start_at, end_at } = req.body;
    const { orderId } = req.params;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const order = await Order.findByPk(orderId);

    if (start_at) {
      const parsedStartAt = parseISO(start_at);
      if (
        !isWithinInterval(parsedStartAt, {
          start: parseISO(format(parsedStartAt, "yyyy-MM-dd'T'08:00:00-03:00")),
          end: parseISO(format(parsedStartAt, "yyyy-MM-dd'T'18:00:00-03:00")),
        })
      ) {
        return res
          .status(400)
          .json({ error: 'Horário de entrega não permitido' });
      }
    }

    if (end_at) {
      const parsedEndAt = parseISO(end_at);
      const parsedStartAt = start_at
        ? parseISO(start_at)
        : parseISO(order.start_at);

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
    }

    if (recipient_id) {
      const recipientExists = await Recipient.findByPk(recipient_id);

      if (!recipientExists) {
        return res.status(400).json({ error: 'Destinatário não encontrado' });
      }
    }

    if (courier_id) {
      const courierExists = await Courier.findByPk(courier_id);

      if (!courierExists) {
        return res.status(400).json({ error: 'Entregador não encontrado' });
      }
    }

    await order.update(req.body);

    return res.json(order);
  }

  async delete(req, res) {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(400).json({ error: 'Encomenda não encontrada' });
    }

    order.canceled_at = new Date();

    await order.save();

    return res.json(order);
  }
}

export default new OrderController();
