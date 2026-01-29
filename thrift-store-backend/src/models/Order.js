import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: {
                    _id: String,
                    name: String,
                    price: Number,
                    images: [String],
                },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["cod", "razorpay"],
            default: "cod",
        },
        shippingAddress: {
            fullName: String,
            phone: String,
            line1: String,
            line2: String,
            city: String,
            state: String,
            postalCode: String,
        },
        paymentInfo: {
            transactionId: String,
            razorpayOrderId: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
