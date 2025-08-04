import React from 'react';
import { Globe, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { CURRENT_NETWORK, CURRENT_CONTRACTS } from '../config/blockchain';

export default function NetworkStatus() {
  const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
  const hasContracts = CURRENT_CONTRACTS.GAME_CONTRACT && CURRENT_CONTRACTS.NARRATIVE_CONTRACT;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg border backdrop-blur-sm ${
      isMainnet 
        ? 'bg-green-900/80 border-green-500 text-green-100' 
        : 'bg-blue-900/80 border-blue-500 text-blue-100'
    }`}>
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          {isMainnet ? (
            <Zap className="w-4 h-4 text-green-400" />
          ) : (
            <Globe className="w-4 h-4 text-blue-400" />
          )}
          <span className="font-medium">
            {isMainnet ? 'MAINNET' : 'TESTNET'}
          </span>
        </div>
        
        <div className="w-px h-4 bg-current opacity-30" />
        
        <div className="flex items-center gap-1">
          {hasContracts ? (
            <CheckCircle className="w-4 h-4 text-current" />
          ) : (
            <AlertCircle className="w-4 h-4 text-current" />
          )}
          <span className="text-xs">
            {hasContracts ? 'Live' : 'No Contracts'}
          </span>
        </div>
      </div>
      
      <div className="text-xs opacity-75 mt-1">
        Chain ID: {CURRENT_NETWORK.chainId}
      </div>
      
      {isMainnet && (
        <div className="text-xs font-medium mt-1 text-green-300">
          🎉 Real XTZ Enabled
        </div>
      )}
    </div>
  );
}
