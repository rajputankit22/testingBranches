var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var loanSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    lenderId:{
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    amount:{
        type: Number,
        required:true,
    },
    processingFee:{
        type: Number,
    },
    upiRefId:{
        type: String,
    },
    comment:{
        type: String,
    },
    remark:{
        type: String,
    },
    total:{
        type: Number,
        required:true,
    },
    timestamp:{
        type:Date,
        default:Date.now
    },
    approved_timestamp:{
        type:Date,
    },
    disbursed_timestamp:{
        type:Date,
    },
    completed_timestamp:{
        type:Date,
    },
    lender_total:{
        type: Number,
        required:true,
    },
    emi_type:{
        type:Number,
        required:true,
        default:0
    },
    emi_count:{
        type:Number,
        required:true,
    },
    emi:[{
        amount:Number,
        extensionCharge:Number,
        upiRefId:String,
        due_date:Date,
        paid_date:{
            type:Date,
        },
        _settled:{
            type:Boolean,
            default:false,
        },
        _disbursed:{
            type:Boolean,
            default:false,
            required:true
        },
        disbursementRefId:String,
        processed_timestamp:{
            type:Date,
        },
        _completed:{
            type:Boolean,
            default:false,
            required:true
        },
    }],
    _approved:{
        type:Boolean,
        default:false,
        required:true
    },
    _deleted:{
        type:Boolean,
        default:false,
        required:true
    },
    _disbursed:{
        type:Boolean,
        default:false,
        required:true
    },
    _completed:{
        type:Boolean,
        default:false,
        required:true
    },
    _defaulted:{
        type:Boolean,
        default:false,
        required:true
    },
    _upi:{
        type:Boolean,
        default:true,
        required:true
    },
});

module.exports = mongoose.model('loans', loanSchema);
