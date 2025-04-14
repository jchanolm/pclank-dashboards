// Token data types
export interface TokenData {
    address: string;
    name: string | null;
    symbol: string | null;
    believerScore: number | null;
    rawBelieverScore: number | null;
    diversityAdjustedScore: number | null;
    marketAdjustedScore: number | null;
    holderToMarketCapRatio: number | null;
    marketCap: number | null;
    walletCount: number | null;
    warpcastWallets: number | null;
    warpcastPercentage: number | null;
    avgSocialCredScore: number | null;
    totalSupply: number | null;
  }
  
  export interface TokenResponse {
    fcs_data: TokenData[];
  }
  
  export interface Believer {
    fid: number;
    username: string;
    bio: string;
    fcred: number;
    balance: number;
  }
  
  export interface BelieversResponse {
    believers: Believer[];
  }