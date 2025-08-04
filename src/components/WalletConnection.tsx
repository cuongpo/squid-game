import React, { useState } from 'react';
import { useBlockchainStore } from '../stores/blockchainStore';
import { walletService } from '../services/walletService';
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { CURRENT_NETWORK } from '../config/blockchain';

interface WalletConnectionProps {
  className?: string;
}

export default function WalletConnection({ className = '' }: WalletConnectionProps) {
  const {
    walletState,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToCorrectNetwork
  } = useBlockchainStore();
  
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    try {
      await connectWallet();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    try {
      await disconnectWallet();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSwitchNetwork = async () => {
    setError(null);
    try {
      await switchToCorrectNetwork();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  if (!walletService.isWalletInstalled()) {
    return (
      <div className={`bg-red-900/20 border border-red-500 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <h3 className="text-red-400 font-semibold">MetaMask Required</h3>
            <p className="text-red-300 text-sm">
              Please install MetaMask to connect your wallet
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-sm mt-2"
            >
              Install MetaMask <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!walletState.isConnected) {
    return (
      <div className={`bg-gray-800 border border-gray-600 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-2">Connect Wallet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Connect your wallet to place bets and participate in the game
          </p>
          
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-squid-pink hover:bg-squid-pink/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {error && (
            <div className="mt-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!walletState.isCorrectNetwork) {
    return (
      <div className={`bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <div className="flex-1">
            <h3 className="text-yellow-400 font-semibold">Wrong Network</h3>
            <p className="text-yellow-300 text-sm">
              Please switch to {CURRENT_NETWORK.chainName} to continue
            </p>
          </div>
          <button
            onClick={handleSwitchNetwork}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors"
          >
            Switch Network
          </button>
        </div>
        
        {error && (
          <div className="mt-3 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-green-900/20 border border-green-500 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <h3 className="text-green-400 font-semibold">Wallet Connected</h3>
            <div className="text-green-300 text-sm">
              <div>Address: {formatAddress(walletState.address!)}</div>
              <div>Balance: {formatBalance(walletState.balance)} XTZ</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDisconnect}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
      
      {error && (
        <div className="mt-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
