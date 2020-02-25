import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      neighborhood: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const recipientExists = await Recipient.findOne({
      where: {
        name: req.body.name,
      },
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'Destinatário já cadastrado' });
    }

    const { id, name } = await Recipient.create(req.body);

    return res.json({ id, name });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      neighborhood: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zipcode: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados' });
    }

    const { name } = req.body;
    const recipient = await Recipient.findByPk(req.params.id);

    if (name && name !== recipient.name) {
      const recipientExists = await Recipient.findOne({
        where: {
          name,
        },
      });

      if (recipientExists) {
        return res.status(400).json({ error: 'Destinatário já cadastrado' });
      }
    }

    const { id } = await recipient.update(req.body);

    return res.json({ id, name });
  }
}

export default new RecipientController();
