import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class CancelOrderController {
  async update(req, res) {
    const { problemId } = req.params;

    const problem = await DeliveryProblem.findByPk(problemId);

    if (!problem) {
      return res.status(400).json({ error: 'Probleman não encontrado' });
    }

    const order = await Order.findByPk(problem.order_id);

    if (!order) {
      return res.status(400).json({ error: 'Encomenda não encontrada' });
    }

    order.canceled_at = new Date();

    await order.save();

    return res.json(order);
  }
}
export default new CancelOrderController();
