export type LoginRequest = {
  signature: string;
  data: {
    pubKey: string;
  };
};
