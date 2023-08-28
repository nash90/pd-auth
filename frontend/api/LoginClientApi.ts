import { WalletContextState } from '@solana/wallet-adapter-react';
import cookie from 'js-cookie';
import { LoginRequest } from "../../type/LoginRequest";
import { ResLogin } from "../../type/ResLogin";
import { signMessageWithWalletAdapter } from '../../../pd-solana/SolanaHelpers';
import { ResLoginStatus } from '../../type/ResLoginStatus';

async function login(walletAdapter: WalletContextState): Promise<ResLogin> {
  const message = {
    pubKey: walletAdapter.publicKey?.toString(),
  }
  const signature = await signMessageWithWalletAdapter(walletAdapter, message)

  const req = {
    signature: signature,
    data: message
  } as LoginRequest
  
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  const res = await response.json() as ResLogin;
  return res
}

async function getLoginStatus(walletAdapter: WalletContextState): Promise<ResLoginStatus> {  
  const response = await fetch('/api/login/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        pubKey: walletAdapter.publicKey?.toString()
      }
    })
  });
  const res = await response.json() as ResLoginStatus;
  // console.log("login Status from api", res)
  return res
}

async function logout(): Promise<ResLoginStatus> {  
  const response = await fetch('/api/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const res = await response.json() as ResLoginStatus;
  // console.log("login Status from api", res)
  return res
}

export {
  login,
  getLoginStatus,
  logout
}