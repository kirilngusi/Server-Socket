"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./utils/logger"));
const nanoid_1 = require("nanoid");
const EVENTS = {
    connection: "connection",
    CLIENT: {
        CREATE_ROOM: "CREATE_ROOM",
        SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
        JOIN_ROOM: 'JOIN_ROOM',
    },
    SERVER: {
        ROOMS: "ROOMS",
        JOINED_ROOM: "JOINED_ROOM",
        ROOM_MESSAGE: "ROOM_MESSAGE",
    },
};
const rooms = {};
function socket({ io }) {
    logger_1.default.info(`Socket enabled`);
    io.on(EVENTS.connection, (socket) => {
        logger_1.default.info(`User connected ${socket.id}`);
        //sending to all connected //
        io.emit(EVENTS.SERVER.ROOMS, rooms);
        //When a users create room//
        socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomName }) => {
            // console.log({ roomName });
            const roomId = (0, nanoid_1.nanoid)();
            //create room id
            rooms[roomId] = {
                name: roomName,
            };
            //add a new to the rooms object
            // console.log(roomId);
            socket.join(roomId);
            //broadcast an event saying there is a new room
            // console.log(rooms)
            socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);
            //emit back to the room creater with all the rooms created
            socket.emit(EVENTS.SERVER.ROOMS, rooms);
            //emit event back the room create saying the have joined a room
            socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
        });
        //When a user send a room message//
        socket.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, ({ roomId, message, username }) => {
            const date = new Date();
            socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                message,
                username,
                time: `${date.getHours()}:${date.getMinutes()}`,
            });
        });
        //When a user join a room//
        socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {
            socket.join(roomId);
            socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
            // console.log(roomId);
        });
        //Join room default//
    });
}
exports.default = socket;
