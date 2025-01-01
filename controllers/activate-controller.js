const path = require('path');
const userService = require('../services/user-service');
const uploadService = require('../services/upload-service');
const UserDto = require('../dtos/user-dto');

class ActivateController{
    async activate(req,res){
        const { name } = req.body;
        const avatar = req.file; // Get the file from FormData (requires multer middleware)
        if(!name || !avatar){
            return res.status(400).json({ message: 'All fields are required.'});
        } 

        const driveLink = await uploadService.uploadToDrive(avatar.path, avatar.originalname);
        const userId = req.user._id;
        // Update user
        try{
            const user = await userService.findUser({ _id: userId });
            if(!user){
                res.status(404).json({ message: 'User not found.' });
            }
            user.activated = true;
            user.name = name;
            user.avatar = driveLink;
            user.save();    
            res.json({ user: new UserDto(user), auth: true });
        }catch(error){
            res.status(500).json({ message: 'Something went wrong!'});
        }
    }
}

module.exports = new ActivateController();