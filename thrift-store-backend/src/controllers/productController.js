const Product = require("../models/Product");

const getProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

module.exports = { getProducts };
