// Blockchain-related types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string; // AVAX balance
  chainId: number | null;
  isCorrectNetwork: boolean;
}

export interface BlockchainBet {
  id: string;
  contestantId: string;
  amount: string; // Amount in AVAX
  odds: number;
  potentialPayout: string; // Potential payout in AVAX
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'won' | 'lost';
  transactionHash?: string;
  blockNumber?: number;
}

export interface OnchainGameState {
  gameId: string;
  currentRound: number;
  totalRounds: number;
  isActive: boolean;
  winner?: string; // Contestant ID
  totalBetAmount: string; // Total AVAX bet
  createdAt: Date;
  completedAt?: Date;
  transactionHash: string;
}

export interface OnchainNarrative {
  gameId: string;
  round: number;
  narrativeText: string[];
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
}

export interface SmartContractEvent {
  eventName: string;
  gameId: string;
  data: any;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: string;
  error?: string;
}
