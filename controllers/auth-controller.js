const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');

// Class used to achieve modularity
class AuthController{
    async sendOtp(req,res) {
        const { email } = req.body;
        if(!email){
            res.status(400).json({ message: 'Email field is required'});
        }
        const otp = await otpService.generateOtp();
        const ttl = 1000 * 120; // Expire time
        const expires = Date.now() + ttl;
        const data = `${email}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);
        try{
            await otpService.sendByEmail(email,otp);
            return res.json({
                hash: `${hash}.${expires}`,
                email
            });
        }catch(err){
            console.log(err);
            res.status(500).json({ message: "Email sending failed "});
        }
        res.json({ hash: hash });
    }
    verifyOtp(req, res){
        const { otp, hash, email } = req.body;
        if(!otp || !hash || !email){
            res.status(400).json({ message: "All fields are required "});
        } 
        const [hashedOtp, expires] = hash.split('.');
        if(Date.now() > expires){
            res.status(400).json({ message: "OTP expired "})
        }
        const data = `${phone}.${split}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp,data);
        if(!isValid){
            res.status(400).json({ message: "Invalid OTP" });
        }

        let user;
        let accessToken;
        let refreshToken;
    }
}

// Using Singleton Pattern
module.exports = new AuthController();