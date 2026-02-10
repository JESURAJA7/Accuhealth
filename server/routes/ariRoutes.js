import express from "express";
import ARI from "../models/ARI.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { Op } from "sequelize";

const router = express.Router();

// POST - Create new ARI notification
router.post("/", authenticateToken, async (req, res) => {
  try {
    const formData = req.body;

    // Basic validation
    if (!formData.patientId || !formData.institution) {
      return res
        .status(400)
        .json({ error: "Missing required fields (patientId, institution)" });
    }

    // Generate string ID for primary key
    const generateId = () => {
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const random = "xxxxxxxxxxxxxxxx"
        .replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16))
        .toLowerCase();
      return timestamp + random; // 24 chars
    };
    formData.id = generateId();

    const notification = await ARI.create(formData);
    res.status(201).json({
      message: "ARI Notification created successfully",
      id: notification.id,
      notificationId: notification.id,
    });
  } catch (error) {
    console.error("Error creating ARI notification:", error);
    res
      .status(500)
      .json({
        error: "Failed to create ARI notification",
        details: error.message,
      });
  }
});

// GET - Get all ARI notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 35, search } = req.query;

    let where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { patientId: { [Op.like]: `%${search}%` } },
        { civilId: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: notifications } = await ARI.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching ARI notifications:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch notifications", details: error.message });
  }
});

export default router;
