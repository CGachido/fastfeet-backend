import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class OrderMail {
  get key() {
    return 'OrderMail';
  }

  async handle({ data }) {
    console.log(data);
    const { courier, created_at, product } = data;
    await Mail.sendMail({
      to: `${courier.name} <${courier.email}>`,
      subject: '[FAST FLEET] - Nova encomenda registrada!',
      template: 'order',
      context: {
        name: courier.name,
        product,
        created_at: format(
          parseISO(created_at),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new OrderMail();
