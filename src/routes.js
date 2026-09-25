const express = require('express');
const { KV } = require('./models');

const apiRouter = express.Router();

apiRouter.get('/kv', async (req, res) => {
  try {
    const kvs = await KV.findAll();
    return res.json({ data: kvs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/kv/:key', async (req, res) => {
  const { key } = req.params;

  try {
    const kv = await KV.findOne({ where: { key } });

    if (kv) {
      return res.json({ data: kv });
    } else {
      return res.status(404).json({ error: 'key not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/kv', async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res
      .status(400)
      .json({ error: 'both key and value fields are required.' });
  }

  try {
    const existingKv = await KV.findOne({ where: { key } });

    if (existingKv) {
      return res.status(400).json({ error: 'key already present in DB.' });
    } else {
      const newKv = await KV.create({ key, value });
      return res.status(201).json({ data: newKv });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/kv/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'value field is required.' });
  }

  try {
    const [updatedCount] = await KV.update({ value }, { where: { key } });

    if (updatedCount > 0) {
      const updatedKv = await KV.findOne({ where: { key } });

      if (updatedKv) {
        return res.json({ data: updatedKv });
      } else {
        return res.status(404).json({ error: 'key not found' });
      }
    } else {
      return res.status(404).json({ error: 'key not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/kv/:key', async (req, res) => {
  const { key } = req.params;

  try {
    const deleted = await KV.destroy({ where: { key } });

    if (deleted > 0) {
      return res.sendStatus(204);
    } else {
      return res.status(404).json({ error: 'key not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = apiRouter;