import DeliveryProblem from '../models/DeliveryProblem';

class OrderDeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { orderId } = req.params;

    const problems = await DeliveryProblem.findAll({
      where: {
        order_id: orderId,
      },
      limit: 20,
      offset: (page - 1) * 20,
      order: ['created_at'],
    });

    return res.json(problems);
  }
}

export default new OrderDeliveryProblemController();
