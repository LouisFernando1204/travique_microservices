const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    bookingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        index: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        index: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    currency: { 
        type: String, 
        default: 'IDR', 
        required: true 
    },
    paymentMethod: { 
        type: String,
        enum: ['credit_card', 'bank_transfer', 'gopay', 'shopeepay', 'qris', 'other'],
        required: false 
    },
    transactionId: { 
        type: String,
        index: true
    },
    transactionTime: { 
        type: Date 
    },
    midtransOrderId: { 
        type: String, 
        unique: true 
    },
    midtransTransactionId: { 
        type: String, 
        sparse: true 
    },
    vaNumber: { 
        type: String, 
        sparse: true 
    },
    bank: { 
        type: String 
    },
    snapToken: { 
        type: String 
    },
    paymentUrl: { 
        type: String 
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'expired', 'canceled', 'refunded'],
        default: 'pending',
        index: true
    },
    fraudStatus: {
        type: String,
        enum: ['accept', 'deny', 'challenge', null],
        default: null
    },
    expiryTime: { 
        type: Date 
    },
    paymentDetail: { 
        type: mongoose.Schema.Types.Mixed 
    }
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", PaymentSchema);