const express = require('express');
const router = express.Router();
const prisma = require('../prisma.config');

// GET /tools - Fetch all tools
router.get('/tools', async (req, res) => {
  try {
    const tools = await prisma.tool.findMany();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/tools", async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const description = typeof req.body.description === 'string'
    ? req.body.description.trim()
    : '';

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required.' });
  }

  try {
    const tool = await prisma.tool.create({
      data: { name, description, isAvailable: true }
    });

    return res.status(201).json(tool);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// PATCH /tools/:id - Borrow/Return tool
router.patch("/tools/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const toolId = Number.parseInt(id, 10);
    if (Number.isNaN(toolId)) {
      return res.status(400).json({ message: "Tool ID must be a number." });
    }

    const existingTool = await prisma.tool.findUnique({ where: { id: toolId } });
    
    if (existingTool) {
      const updatedTool = await prisma.tool.update({
        where: { id: toolId },
        data: { isAvailable: !existingTool.isAvailable }
      });
      res.json(updatedTool);
    } else {
      res.status(404).json({ message: "Tool not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
