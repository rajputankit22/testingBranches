var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	name:{
		type: String,
		required:true,
	},
	phone:{
		type: Number,
		required: true,
		unique: true
	},
	email:{
		type: String,
		required:true,
	},
	alternate_email:{
		type: String,
	},
	alternate_phone:{
		phone_1: Number,
		phone_2: Number,
	},
	restoreId:{
	  type: String,
  },
	comment:{
		type: String,
	},
	auth_token:[{
		old_refresh_token:{
			type: String,
		},
		old_auth:{
			type: String,
		},
		auth:{
			type: String,
		},
		refresh_token:{
			type: String,
		},
		timestamp:{
			type: String,
		},
		device_data:{
			device:String,
			// imei_number_1:String,
			// imei_number_2:String,
			version_code:String,
			version_number:String,
			carrier:String,
			nfc:String,
			android_version:String,
		}
	}],
	fees:[{
		description:String,
		amount:Number,
		upiRefId:String,
		timestamp:{
			type:Date,
			default:Date.now
		},
		paid_date:{
			type:Date,
		},
		_paid:{
            type:Boolean,
            default:false,
            required:true
        },
	}],
	vpa:{
		type: String,
	},
	category:{
		type: Number,
	},
	gender:{
		type: String,
	},
	user_limit:{
		type: Number,
	},
	address:{
		type: String,
	},
	permanent_address:{
		city: String,
		pin: String,
		address: String,
	},
	city:{
		type: String,
	},
	pin:{
		type: String,
	},
	dob:{
		type: String,
		default:'02/03/1995',
	},
	fcmId:[{
		type:String,
	}],
	lastLogin: {
		type: String,
		unique : false,
		default : "Never"
	},
	doj:{
		type : String,
	},
	amount_pledged:{
		type : Number,
		default:0,
	},
	total_lent:{
		type : Number,
		default:0,
	},
	total_returns:{
		type : Number,
		default:0,
	},
	months_pledged:{
		type : Number,
	},
	date_pledged:{
		type : String,
	},
	selfie:{
		type : String,
	},
	aadhar:{
		number:{
			type: String,
		},
		image:{
			type: String,
		},
		imageBack:{
			type: String,
		},
	},
	guardian:{            // Unusable
		name:{
			type: String,
			default:"",
		},
		number:{
			type: String,
			default:"",
		},
	},
	utility:{
		current:{
			type: String,
		},
		permanent:{
			type: String,
		},
	},
	passport:{
		number:{
			type: String,
		},
		image:{
			type: String,
		},
	},
	pan:{
		number:{
			type: String,
		},
		image:{
			type: String,
		},
	},
	location:{
    latitude: String,
		longitude: String,
	},
	_student:{
		required:true,
		type:Boolean,
		default:true
	},
	employee:{
		employeeId:String,
		employeeIdBack:String,
		sector:String,
		occupation:String,
		income:String,
		company_name:String,
		company_address:String,
		company_city:String,
		company_pin:String,
		total_working_experiance:String,
		current_working_experiance:String,
		salary_date:String,
		statement_1:String,
		statement_2:String,
		statement_3:String,
	},
	bank:{
		accName:String,
		accNumber:String,
		ifsc:String,
	},
	recommendation:{
		type: String,
	},
	student:{
		expenses:String,
		source:String,
		college:String,
		credit_date:String,
		accomodation:String,
		university:String,
		course:String,
		start_year:String,
		end_year:String,
		enrollment:String,
		purpose:String,
		city:String,
		address:String,
		pin:String,
		studentId:String,
		studentIdBack:String,
		statement_1:String,
		statement_2:String,
		statement_3:String,
	},
	startup:{
		business_nature:String,
		company_name:String,
	  name:String,             //Unusable
	  address:String,
	  city:String,
	  pin:String,
	  turnover:String,
	  business_age:String,
	  business_type:String,
	  business_mode:String,
	  profit:String,
	  founders:String,		//Unusable
	  employees:String,		//Unusable
	  role:String,		//Unusable
	  foundedDate:String,		//Unusable
	  facebookPage:String,		//Unusable
	  websiteLink:String,		//Unusable
	  _incubator:Boolean,		//Unusable
	  incubatorName:String,		//Unusable
	  _funded:Boolean,		//Unusable
	  fundingAmount:String,		//Unusable
		statement_1:String,
		businessProofType:String,
		businessProofFront:String,
	},
	_otp:{
		value:{
			type: Number,
		},
		count:{
			type: Number,
		},
		timestamp:{
			type : Date,
		},
	},
	_login:{
		required:true,
		type:Boolean,
		default:true
	},
	_registered:{
		required:true,
		type:Boolean,
		default:false
	},
	_email:{
		required:true,
		type:Boolean,
		default:false
	},
	_personal:{
		required:true,
		type:Boolean,
		default:false
	},
	_document:{
		required:true,
		type:Boolean,
		default:false
	},
	_professional:{
		required:true,
		type:Boolean,
		default:false
	},
	_additional:{
		required:true,
		type:Boolean,
		default:false
	},
	_bank:{
		required:true,
		type:Boolean,
		default:false
	},
	_startup:{
		required:true,
		type:Boolean,
		default:false
	},
	_lender:{
		required:true,
		type:Boolean,
		default:false
	},
	_verify:{
		phone_1:Boolean,
		phone_2:Boolean,
	},
	_contacts:{
		required:true,
		type:Boolean,
		default:false
	},
	_messages:{
		required:true,
		type:Boolean,
		default:false
  },
	_calllog:{
		required:true,
		type:Boolean,
		default:false
  },
	_lock:{
		required:true,
		type:Boolean,
		default:false
	},
	_paid:{
		required:true,
		type:Boolean,
		default:false
	},
	history:[{
		timestamp:{
			type:Date
		},
		notification_history:{
			type:String
		},
		type:{
			type:String
		}
	}],
});

module.exports = mongoose.model('users', userSchema);
