import { Server, Socket } from "socket.io";
import logger from "./utils/logger";
import { nanoid } from "nanoid";

const EVENTS = {
  connection: "connection",
  CLIENT: {
    CREATE_ROOM: "CREATE_ROOM",
    SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
    JOIN_ROOM:'JOIN_ROOM',
  },
  SERVER: {
    ROOMS: "ROOMS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
  },
};

const rooms: Record<string, { name: string }> = {};

function socket({ io }: { io: Server }) {
  logger.info(`Socket enabled`);

  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`User connected ${socket.id}`);

    //sending to all connected //
    io.emit(EVENTS.SERVER.ROOMS, rooms);

    //When a users create room//
    socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomName }) => {
      
      // console.log({ roomName });


      const roomId = nanoid();

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
    socket.on(
      EVENTS.CLIENT.SEND_ROOM_MESSAGE,
      ({ roomId, message, username }) => {
        const date = new Date();

        socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
          message,
          username,
          time: `${date.getHours()}:${date.getMinutes()}`,
        });
      }
    );

    //When a user join a room//
    socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {
      socket.join(roomId);
      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
      // console.log(roomId);
    })


    //Join room default//


    
  });
}

export default socket;
