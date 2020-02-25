import * as Yup from 'yup';
import { Op } from 'sequelize';
import { parseISO, format, isWithinInterval } from 'date-fns';
import Order from '../models/Order';

class WithdrawalOrderController {
  async update(req, res) {
    const schema = Yup.object().shape({
      start_at: Yup.date().required(),
    });

    const { start_at } = req.body;
    const { courierId, orderId } = req.params;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(400).json({
        error: 'Encomenda não encontrada',
      });
    }

    if (order.start_at) {
      return res.status(400).json({
        error: 'Encomenda já consta como retirada',
      });
    }

    if (start_at) {
      const parsedStartAt = parseISO(start_at);

      const totalOrdersDay = await Order.count({
        where: {
          courier_id: courierId,
          start_at: {
            [Op.gte]: parseISO(
              format(parsedStartAt, "yyyy-MM-dd'T'00:00:00-03:00")
            ),
            [Op.lt]: parseISO(
              format(parsedStartAt, "yyyy-MM-dd'T'23:59:59-03:00")
            ),
          },
        },
      });

      if (totalOrdersDay >= 5) {
        return res
          .status(400)
          .json({ error: 'Você excedeu a quantidade de retiradas diária' });
      }

      if (
        !isWithinInterval(parsedStartAt, {
          start: parseISO(format(parsedStartAt, "yyyy-MM-dd'T'08:00:00-03:00")),
          end: parseISO(format(parsedStartAt, "yyyy-MM-dd'T'18:00:00-03:00")),
        })
      ) {
        return res
          .status(400)
          .json({ error: 'Horário de retirada não permitido' });
      }
    }

    if (parseInt(courierId, 0) !== parseInt(order.courier_id, 0)) {
      return res.status(400).json({
        error: 'Somente o próprio entregador pode retirar a encomenda',
      });
    }

    await order.update({ start_at });

    return res.json(order);
  }
}

export default new WithdrawalOrderController();
