import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useBlockchainStore } from '../stores/blockchainStore';
import ContestantCard from './ContestantCard';
import BlockchainBettingModal from './BlockchainBettingModal';
import BlockchainBettingInfo from './BlockchainBettingInfo';
import { getContestantsByProbability } from '../utils/contestantUtils';
import { CURRENT_NETWORK } from '../config/blockchain';

export default function BettingScreen() {
  const { gameState, setGamePhase, simulateNextRound, enableBlockchainLogging } = useGameStore();
  const { walletState, currentGameId, disableRoundLogging, setDisableRoundLogging } = useBlockchainStore();
  const [selectedContestantForBet, setSelectedContestantForBet] = useState<string | null>(null);
  
  const aliveContestants = gameState.contestants.filter(c => c.status === 'alive');
  const sortedContestants = getContestantsByProbability(aliveContestants);

  const handleStartSimulation = async () => {
    // For single-player game, the blockchain game is created automatically when placing bets
    if (currentGameId) {
      console.log('Using existing single-player game:', currentGameId);
      // Ensure narrative logging is enabled for existing game
      enableBlockchainLogging(currentGameId);
    }

    setGamePhase('simulation');
    // Automatically start the first round
    setTimeout(() => {
      simulateNextRound();
    }, 500);
  };

  const handleBetClick = (contestantId: string) => {
    setSelectedContestantForBet(contestantId);
  };

  const closeBetModal = () => {
    setSelectedContestantForBet(null);
  };

  return (
    <div className="space-y-8">
      {/* Betting Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-squid-pink">Place Your Bets</h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Study the contestants and their odds. Choose wisely - only one will survive to claim victory.
        </p>
        
        {/* Balance Display */}
        <div className="bg-squid-gray rounded-lg p-4 inline-block">
          <div className="text-center">
            <div className="text-sm text-gray-400">Your XTZ Balance</div>
            <div className="text-2xl font-bold text-squid-green">
              {walletState.isConnected
                ? `${parseFloat(walletState.balance).toFixed(4)} XTZ`
                : 'Connect Wallet'
              }
            </div>
            {!walletState.isConnected && (
              <div className="text-xs text-gray-500 mt-1">
                Connect your wallet to start betting
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blockchain Betting Info */}
      {walletState.isConnected && (
        <BlockchainBettingInfo />
      )}

      {/* XTZ Betting Tips */}
      <div className="bg-squid-gray rounded-lg p-6">
        <h3 className="text-xl font-bold text-squid-green mb-4">XTZ Betting Tips</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-2">Lower Odds = Higher Chance</h4>
            <p className="text-gray-300">
              Contestants with lower odds are more likely to win, but offer smaller XTZ payouts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Blockchain Transparency</h4>
            <p className="text-gray-300">
              All bets and results are stored onchain for complete transparency. Your XTZ payouts are automatic!
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Smart Contract Security</h4>
            <p className="text-gray-300">
              Your XTZ bets are secured by smart contracts. Winners are paid automatically when the game ends.
            </p>
          </div>
        </div>
      </div>

      {/* Contestants Grid */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Contestants (Sorted by Win Probability)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {sortedContestants.map((contestant) => (
            <ContestantCard 
              key={contestant.id} 
              contestant={contestant} 
              showBettingInfo={true}
              onBetClick={() => handleBetClick(contestant.id)}
            />
          ))}
        </div>
      </div>

      {/* Blockchain Settings */}
      {walletState.isConnected && walletState.isCorrectNetwork && (
        <div className="bg-squid-gray rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">⚙️ Blockchain Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={disableRoundLogging}
                onChange={(e) => setDisableRoundLogging(e.target.checked)}
                className="w-4 h-4 text-squid-pink bg-gray-700 border-gray-600 rounded focus:ring-squid-pink focus:ring-2"
              />
              <span className="text-sm">
                <strong>Disable Round-by-Round Confirmations</strong>
                <br />
                <span className="text-gray-400">
                  Skip blockchain transactions for each round (only confirm once at the end)
                </span>
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Start Simulation Button */}
      <div className="text-center space-y-4">
        <button
          onClick={handleStartSimulation}
          disabled={!walletState.isConnected || !walletState.isCorrectNetwork}
          className={`text-xl px-8 py-4 font-semibold rounded-lg transition-colors ${
            walletState.isConnected && walletState.isCorrectNetwork
              ? 'bg-squid-pink hover:bg-squid-pink/80 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {walletState.isConnected && walletState.isCorrectNetwork
            ? 'Start the Games'
            : 'Connect Wallet to Start'
          }
        </button>
        <p className="text-sm text-gray-400">
          {walletState.isConnected && walletState.isCorrectNetwork
            ? 'Place XTZ bets until the games begin'
            : `Connect your wallet to ${CURRENT_NETWORK.chainName} to participate`
          }
        </p>
      </div>

      {/* Blockchain Bet Modal */}
      {selectedContestantForBet && (
        <BlockchainBettingModal
          contestant={gameState.contestants.find(c => c.id === selectedContestantForBet)!}
          isOpen={true}
          onClose={closeBetModal}
        />
      )}
    </div>
  );
}
