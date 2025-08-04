import React from 'react';
import { useBlockchainStore } from '../stores/blockchainStore';
import { ExternalLink, Database, Shield, TrendingUp } from 'lucide-react';
import { CURRENT_NETWORK } from '../config/blockchain';

export default function BlockchainGameStatus() {
  const { 
    walletState, 
    onchainGameState, 
    currentGameId, 
    blockchainBets,
    pendingTransactions 
  } = useBlockchainStore();

  // Don't show if wallet not connected or no blockchain game
  if (!walletState.isConnected || !currentGameId) {
    return null;
  }

  const getExplorerUrl = (hash: string) => {
    return `${CURRENT_NETWORK.blockExplorerUrls[0]}/tx/${hash}`;
  };

  const getGameExplorerUrl = (gameId: string) => {
    return `${CURRENT_NETWORK.blockExplorerUrls[0]}/address/${gameId}`;
  };

  const totalBetAmount = blockchainBets.reduce((sum, bet) => 
    sum + parseFloat(bet.amount), 0
  );

  const winningBets = blockchainBets.filter(bet => bet.status === 'won');
  const totalWinnings = winningBets.reduce((sum, bet) => 
    sum + parseFloat(bet.potentialPayout), 0
  );

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Blockchain Game Status</h3>
      </div>

      {/* Game Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Game ID</span>
          </div>
          <div className="text-white font-mono text-sm break-all">
            {currentGameId}
          </div>
          <a
            href={getGameExplorerUrl(currentGameId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2"
          >
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">Network</span>
          </div>
          <div className="text-white font-semibold">
            {CURRENT_NETWORK.chainName}
          </div>
          <div className="text-green-400 text-xs">
            Chain ID: {walletState.chainId}
          </div>
        </div>
      </div>

      {/* Betting Statistics */}
      {blockchainBets.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Your Blockchain Bets</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Total Bets</div>
              <div className="text-white font-semibold">{blockchainBets.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Amount</div>
              <div className="text-white font-semibold">{totalBetAmount.toFixed(4)} XTZ</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Winning Bets</div>
              <div className="text-green-400 font-semibold">{winningBets.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Winnings</div>
              <div className="text-green-400 font-semibold">{totalWinnings.toFixed(4)} XTZ</div>
            </div>
          </div>
        </div>
      )}

      {/* Onchain Game State */}
      {onchainGameState && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Onchain Game Data</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Current Round</div>
              <div className="text-white font-semibold">{onchainGameState.currentRound}</div>
            </div>
            <div>
              <div className="text-gray-400">Total Rounds</div>
              <div className="text-white font-semibold">{onchainGameState.totalRounds}</div>
            </div>
            <div>
              <div className="text-gray-400">Status</div>
              <div className={`font-semibold ${onchainGameState.isActive ? 'text-green-400' : 'text-red-400'}`}>
                {onchainGameState.isActive ? 'Active' : 'Completed'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Total Bet Amount</div>
              <div className="text-white font-semibold">{onchainGameState.totalBetAmount} XTZ</div>
            </div>
            {onchainGameState.winner && (
              <div>
                <div className="text-gray-400">Winner</div>
                <div className="text-yellow-400 font-semibold">{onchainGameState.winner}</div>
              </div>
            )}
            <div>
              <div className="text-gray-400">Created</div>
              <div className="text-white font-semibold">
                {onchainGameState.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {pendingTransactions.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Recent Transactions</h4>
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

      {/* Blockchain Benefits */}
      <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-2">🔗 Blockchain Benefits</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Transparent and immutable game results</li>
          <li>• Verifiable betting history onchain</li>
          <li>• Automatic smart contract payouts</li>
          <li>• Permanent narrative storage</li>
        </ul>
      </div>
    </div>
  );
}
