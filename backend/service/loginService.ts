import { Socket } from "socket.io";
import jwt from 'jsonwebtoken';

import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { verifySignature } from "../../../solana/SolanaHelpers";
import { getUserOrCreate } from "../../../pg-core/backend/db/userCollection";
import { LoginRequest } from "../../type/LoginRequest";
import { JWT_SECRETE, TOKEN_PAYLOAD_TYPE } from "../../utils/AuthHelpers";

const loginService = async (req: LoginRequest) => {
  const {
    signature,
    data,
  } = req;

  const isAuthenticated = verifySignature(signature, data)

  const user = await getUserOrCreate(data.pubKey)
  return {
    isAuthenticated,
    user
  }
}

const wsAuthService = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    // Listen for the authenticate event
    socket.on('authenticate', (token) => {
      try {
        // Validate the JWT token
        const decoded = jwt.verify(token, JWT_SECRETE) as TOKEN_PAYLOAD_TYPE;
  
        // Create a socket channel with a unique identification from the token
        const channelId = decoded.user;
        socket.join(channelId);
  
        console.log(`User websocket authenticated with ID ${channelId}`);
      } catch (error) {
        console.log('Websocket Token Authentication failed:', error);
      }
    }
  )
}

export {
  loginService,
  wsAuthService,
}