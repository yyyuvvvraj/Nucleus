const Complaint = require('../models/Complaint');

const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.params.userId || req.user._id });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addComplaint = async (req, res) => {
    const { title, description } = req.body;
    try {
        const complaint = new Complaint({
            userId: req.user._id,
            title,
            description
        });
        const createdComplaint = await complaint.save();
        res.status(201).json(createdComplaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getComplaints, addComplaint };
