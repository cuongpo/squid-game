import React from 'react';
import { useBlockchainStore } from '../stores/blockchainStore';
import { Shield, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { CURRENT_NETWORK } from '../config/blockchain';

export default function BlockchainBettingInfo() {
  const { 
    walletState, 
    blockchainBets, 
    currentGameId,
    pendingTransactions 
  } = useBlockchainStore();

  // Don't show if wallet not connected
  if (!walletState.isConnected || !walletState.isCorrectNetwork) {
    return null;
  }

  const activeBets = blockchainBets.filter(bet => bet.status === 'confirmed');
  const pendingBets = blockchainBets.filter(bet => bet.status === 'pending');
  
  const totalBetAmount = activeBets.reduce((sum, bet) => 
    sum + parseFloat(bet.amount), 0
  );

  const totalPotentialPayout = activeBets.reduce((sum, bet) => 
    sum + parseFloat(bet.potentialPayout), 0
  );

  const getExplorerUrl = (hash: string) => {
    return `${CURRENT_NETWORK.blockExplorerUrls[0]}/tx/${hash}`;
  };

  return (
    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-blue-400">Blockchain Betting</h3>
      </div>

      {/* Current Game Info */}
      {currentGameId && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Current Game ID</div>
          <div className="text-white font-mono text-xs break-all">
            {currentGameId}
          </div>
        </div>
      )}

      {/* Betting Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">Active Bets</div>
          <div className="text-white font-semibold">{activeBets.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">Total Amount</div>
          <div className="text-white font-semibold">{totalBetAmount.toFixed(4)} AVAX</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">Potential Payout</div>
          <div className="text-green-400 font-semibold">{totalPotentialPayout.toFixed(4)} AVAX</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">Your Balance</div>
          <div className="text-white font-semibold">{parseFloat(walletState.balance).toFixed(4)} AVAX</div>
        </div>
      </div>

      {/* Active Bets List */}
      {activeBets.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Your Active Bets</h4>
          <div className="space-y-2">
            {activeBets.map((bet) => (
              <div key={bet.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                <div>
                  <span className="text-white font-semibold">Contestant {bet.contestantId}</span>
                  <span className="text-gray-400 ml-2 text-sm">
                    {bet.amount} XTZ at {bet.odds.toFixed(1)}x
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold text-sm">
                    {bet.potentialPayout} XTZ
                  </div>
                  {bet.transactionHash && (
                    <a
                      href={getExplorerUrl(bet.transactionHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      View Tx
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Bets */}
      {pendingBets.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-400" />
            <h4 className="text-yellow-400 font-semibold">Pending Bets</h4>
          </div>
          <div className="space-y-2">
            {pendingBets.map((bet) => (
              <div key={bet.id} className="flex justify-between items-center">
                <span className="text-yellow-300 text-sm">
                  {bet.amount} XTZ on Contestant {bet.contestantId}
                </span>
                <span className="text-yellow-400 text-xs">Confirming...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {pendingTransactions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {pendingTransactions.slice(0, 3).map((tx) => (
              <div key={tx.hash} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.status === 'confirmed' ? 'bg-green-400' :
                    tx.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-white font-mono text-xs">
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                  </span>
                  <span className={`text-xs ${
                    tx.status === 'confirmed' ? 'text-green-400' :
                    tx.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
                <a
                  href={getExplorerUrl(tx.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="text-xs text-blue-300 space-y-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          <span>Transparent, immutable betting on Etherlink</span>
        </div>
        <div>• Automatic smart contract payouts</div>
        <div>• Verifiable game results onchain</div>
        <div>• No intermediaries or fees</div>
      </div>
    </div>
  );
}
