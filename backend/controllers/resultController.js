const Result = require('../models/Result');

const getResults = async (req, res) => {
    try {
        const results = await Result.find({ userId: req.params.userId || req.user._id });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getResults };
