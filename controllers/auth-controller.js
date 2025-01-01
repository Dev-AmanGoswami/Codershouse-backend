const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');

// DTOs
const UserDto = require('../dtos/user-dto');

// Class used to achieve modularity
class AuthController{
    async sendOtp(req,res) {
        const { email } = req.body;
        if(!email){
            return res.status(400).json({ message: 'Email field is required'});
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
            return res.status(500).json({ message: "Email sending failed "});
        }
        res.json({ hash: hash });
    }
    async verifyOtp(req, res){
        const { otp, hash, email } = req.body;
        if(!otp || !hash || !email){
            return res.status(400).json({ message: "All fields are required "});
        } 
        const [hashedOtp, expires] = hash.split('.');
        // Converting expires data to number data type
        if(Date.now() > +expires){
            return res.status(400).json({ message: "OTP expired."})
        }
        const data = `${email}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp,data);
        if(!isValid){
            return res.status(400).json({ message: "Invalid OTP." });
        }

        let user;
        try{
            user = await userService.findUser({ email });
            if(!user){
                user = await userService.createUser({ email });
            }
        }catch(error){
            console.log(error);
            return res.status(500).json({ message: 'DB error' });
        }

        const { accessToken, refreshToken } = tokenService.generateTokens({ _id: user._id, activated: false });

        await tokenService.storeRefreshToken(refreshToken,user._id);
        // Attaching http only cookie, so that Client JS won't be able to access it
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        res.cookie('accesstoken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        // Transforming object recieved from MongoDb
        const userDto = new UserDto(user);
        res.json({ user: userDto, auth: true });
    }
    
    async refresh(req, res){
        const { refreshtoken: refreshTokenFromCookie } = req.cookies;
        let userData;
        try{
            userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        }catch(error){
            console.log(error);
            res.status(401).json({ message: 'Invalid token.'})
        }        
        // Check if in database
        try{
            const token = await tokenService.findRefreshToken( userData._id, refreshTokenFromCookie );
            if(!token){
                return res.status(401).json({ message: 'Invalid token.'})
            }
        }catch(error){
            console.log(error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    
        // Check valid user
        const user = await userService.findUser({ _id: userData._id });
        if(!user){
            return res.status(404).json({ message: 'No such user.'});
        }

        // Generating new tokens
        const { refreshToken, accessToken } = tokenService.generateTokens({ _id: userData._id });
        
        // Update refresh token in Db
        try{
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        }catch(error){
            console.log(error);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        res.cookie('refreshtoken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        res.cookie('accesstoken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        // Response
        const userDto = new UserDto(user);
        res.json({ user: userDto, auth: true });
    }

    async logout(req, res){
        // Delete refresh token from db
        const { refreshtoken } = req.cookies;
        await tokenService.removeToken( refreshtoken );
        // Removing Cookies 
        res.clearCookie('refreshtoken');
        res.clearCookie('accesstoken');
        res.json({ user: null, auth: false })
    }
}

// Using Singleton Pattern
module.exports = new AuthController();