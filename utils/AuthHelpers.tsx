import { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';
import { Dispatch, useEffect } from "react";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { getLoginStatus, login, logout } from "../frontend/api/LoginClientApi";
import { ResLogin } from "../type/ResLogin";
import { ResUser } from "../../pd-core/type/ResUser";
import { FAILED_TO_AUTHENTICATE_LOGIN, FAILED_TO_DECODE_TOKEN, GAME_IS_DISABLED, GAME_SETTINGS_NOT_FOUND, INSUFFICIENT_DEPOSIT_BALANCE, TOKEN_NOT_FOUND } from "../../pd-core/error/errorMessages";
import { getUserApi } from "../../pd-core/frontend/api/UserClientApi";

import { UserModel } from "../../pd-core/backend/db/UserModel";
import { SettingsModel } from "../../pd-core/backend/db/SettingsModel";
import { CommonActionParam } from "../../pd-core/frontend/reducers/CommonReducer";
import { setGameUserAndSettingsAction, setTokenAction } from "../../pd-core/frontend/actions/CommonAction";
import { ResLoginStatus } from "../type/ResLoginStatus";

export const JWT_SECRETE = process.env.JWT_SECRETE || "";

export type TOKEN_PAYLOAD_TYPE = {
  user: string,
  iat?: number,
  exp?: number
}

const getTokenPayload = (token: string) => {
  try {
    const decoded = jwt.decode(token);
    // console.log("decoded jwt", token, decoded)
    return decoded as TOKEN_PAYLOAD_TYPE
  } catch (err) {
    console.log(FAILED_TO_DECODE_TOKEN, err)
    throw Error (FAILED_TO_DECODE_TOKEN)
  }
}

const getDecodedToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRETE);
    // console.log("decoded jwt", token, decoded)
    return decoded as TOKEN_PAYLOAD_TYPE
  } catch (err) {
    console.log(FAILED_TO_DECODE_TOKEN, err)
    throw Error (FAILED_TO_DECODE_TOKEN)
  }
}

const getDecodedTokenFromReq = (
  req: NextApiRequest,
  res: NextApiResponse
): TOKEN_PAYLOAD_TYPE | undefined => {
  const cookies = req.cookies
  const token = cookies["playdegen-token"]

  if(!token) {
    // res.status(401).send({ message: , status: "0" });
    throw Error(TOKEN_NOT_FOUND)
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRETE);
    // console.log("decoded jwt", token, decoded)
    return decoded as TOKEN_PAYLOAD_TYPE
  } catch (err) {
    console.log(err)
    // res.status(401).send({ message: 'Token Invalid', status: "0" });
    throw Error(FAILED_TO_DECODE_TOKEN)
  }

}

const validateTokenPayloadForUser = (tokenPayload: TOKEN_PAYLOAD_TYPE | undefined, userId: string) => {
  if(!tokenPayload) {
    throw Error("Unauthorized Access!!")
  }

  if(tokenPayload.user !== userId) {
    console.log("Unauthorized Wallet for Token!!", tokenPayload.user, userId)
    throw Error(FAILED_TO_AUTHENTICATE_LOGIN)
  }
}

const getTokenPlayloadAndValidateUser = (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) => {
  try {
    const payload = getDecodedTokenFromReq(req, res)

    validateTokenPayloadForUser(payload, userId)

    return payload

  } catch (err) {
    console.log("INFO: Failed to parse or validate token", err);
    throw Error(FAILED_TO_AUTHENTICATE_LOGIN)
  }
}

const validateTokenUser = (
  token: string,
  userId: string,
) => {
  const payload = getDecodedToken(token)

  validateTokenPayloadForUser(payload, userId)

  return payload
}

const useEffectAuth = (
  walletAdapter: WalletContextState,
  dispatch: Dispatch<CommonActionParam>
  ) => {
  useEffect(() => {
    console.log("wallet connected status", walletAdapter.connected)
    if(walletAdapter.connected) {

      getLoginStatus(walletAdapter).then((res: ResLoginStatus) => {

        // If login status api is sucess
        if(res.status === "1") {
          // Check for case where user swtich another wallet after login by seperate wallet
          // validate the token user match the wallet
          const tokenInfo = getTokenPayload(res.pdtok as string)
          if(tokenInfo.user !== walletAdapter?.publicKey?.toString()) {
            logout().then(() => {
              setTokenAction(dispatch, "")
              location.reload();
            })
            return
          }

          // if token is correct wallet save in state
          setTokenAction(dispatch, res.pdtok as string)

        } else {
          login(walletAdapter).then((logRes: ResLogin) => {
            setTokenAction(dispatch, logRes.token as string)
          })
        } 
      })

    } else {
      logout().then(() => {
        setTokenAction(dispatch, "")
      })
    }
  }, [walletAdapter.connected])
}

const validateUserAndBalance = (user: UserModel | undefined) => {
  if (!user) {
    throw Error(INSUFFICIENT_DEPOSIT_BALANCE)
  }

  // if (
  //   user.solBalance < 0.05 * appConstants.SOL_TO_LAMPORT
  // ) {
  //   throw Error(INSUFFICIENT_DEPOSIT_BALANCE)
  // }

  if (
    !user.usdBalance ||
    user.usdBalance < (0.5)
  ) {
    throw Error(INSUFFICIENT_DEPOSIT_BALANCE)
  }
}

const validateAppSettings = (settings: SettingsModel) => {
  if(!settings) {
    throw Error(GAME_SETTINGS_NOT_FOUND)
  }

  if(settings.disableGame) {
    throw Error(GAME_IS_DISABLED)
  }
}

const getUserInfoAndGameSettings = (
    userId: string,
    dispatch: React.Dispatch<CommonActionParam>,
  ) => {
  return getUserApi(userId).then((resUser: ResUser) => {
    setGameUserAndSettingsAction(
      dispatch,
      {
        user: resUser.data.user as UserModel,
        settings: resUser.data.settings as SettingsModel
      }
    )
    return resUser
  })
}

export {
  getTokenPayload,
  getDecodedToken,
  getDecodedTokenFromReq,
  validateTokenPayloadForUser,
  getTokenPlayloadAndValidateUser,
  useEffectAuth,
  validateTokenUser,
  getUserInfoAndGameSettings,
  validateAppSettings,
  validateUserAndBalance
}