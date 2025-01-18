const roomModel = require("../models/room-model");

class RoomService{
    async create(payload){
        const { topic, roomType, ownerId } = payload;
        const room = await roomModel.create({
            topic,
            roomType,
            ownerId,
            speakers: [ownerId]
        });
        return room;
    }

    async getAllRooms(types){
        // Special Query to get all the objects filtered by types array
        const rooms = await roomModel.find({ roomType: { $in: types }})
        .populate('speakers') // Populate used to show speaker and ownerId document object
        .populate('ownerId')
        .exec();
        return rooms;
    }

    async getRoom(roomId){
        const room = await roomModel.findOne({ _id: roomId });
        return room;
    }
}

module.exports = new RoomService();