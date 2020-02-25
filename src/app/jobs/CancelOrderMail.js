import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancelOrderMail {
  get key() {
    return 'CancelOrderMail';
  }

  async handle({ data }) {
    const { courier, canceled_at, id } = data;
    await Mail.sendMail({
      to: `${courier.name} <${courier.email}>`,
      subject: '[FAST FEET] - Encomenda Cancelada!',
      template: 'cancelOrder',
      context: {
        id,
        name: courier.name,
        canceled_at: format(
          parseISO(canceled_at),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new CancelOrderMail();
