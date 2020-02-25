import Order from '../models/Order';

class CourierOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { courierId } = req.params;

    const orders = await Order.findAll({
      where: {
        courier_id: courierId,
        end_at: null,
        canceled_at: null,
      },
      limit: 20,
      offset: (page - 1) * 20,
      order: ['created_at'],
    });

    return res.json(orders);
  }
}

export default new CourierOrderController();
