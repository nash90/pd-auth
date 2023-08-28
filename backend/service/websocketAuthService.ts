import { TOKEN_PAYLOAD_TYPE, validateTokenUser } from "../../utils/AuthHelpers";
import { getUser } from "../../../pd-core/backend/db/userCollection";

export const wsValidateTokenAndGetUser = async (token: string, userId: string) => {
  // Validate the JWT token and get User
  let decodedToken: TOKEN_PAYLOAD_TYPE
  try {
    decodedToken = validateTokenUser(token, userId)
    const user = await getUser(decodedToken.user)
    return user

  } catch(err) {

    return undefined
  }
}

