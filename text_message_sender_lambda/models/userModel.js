var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var userSchema = new Schema({ //define what our object/model class look like 
    //username: String,
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
    //reset password related
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    groups: [Schema.Types.ObjectId],
    
    //balance
    balance:{
        remainingMessagesThisMonthCycle: { type : Number, default: 0 },
        billingCycleEndDate: { type : Date, default: Date.now() },    //update via all subscription webhooks
    },

    //braintree related
    billing :{
        /* custId will be same as user._id , so dont store again
        custId: {
            type: String,
            unique: true,
        },
        */
        plan : String, //Not used anywhere so far.
    },

    //trial period
    trialPeriod: {
        trialExpired : { type: Boolean, default: false},
        trialFinishDate : Date,
    },

    //twilio related info , area code?
    twilioNumber : String,
    twilioNumberSid: String,
    country: String,     //store twilio country code string

});

//to crypt user password and store encrypted version
userSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null,function (err, hash) {//krutikq - bcrypt-js takes 4 args, that null is progress fn callback
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

userSchema.methods.comparePassword = async function (passw) {
    /*
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
    */
    const isMatch = await bcrypt.compareSync(passw, this.password);
    return isMatch;
};
/*
//
// after saving
userSchema.post('save', function(doc, next) {
    
    next();
});

// pre-delete
userSchema.pre('remove', function(doc) {

});
// post-delete
userSchema.post('remove', function(doc) {

});
//
*/
var Users = mongoose.model('Users',userSchema);//Thus Todos becomes mongoose created model, and will have some useful methods on it

module.exports = Users;