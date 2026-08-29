module.exports = (req, res) => {
    res.status(200).json({ status: "ok", message: "Serverless test function working!" });
};
