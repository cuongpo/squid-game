import { useGameStore } from '../stores/gameStore';
import { useBlockchainStore } from '../stores/blockchainStore';
import { formatCurrency, getBettingStats } from '../utils/bettingSystem';

export default function GameOverScreen() {
  const { gameState, bettingState, resetGame } = useGameStore();
  const { blockchainBets, walletState } = useBlockchainStore();

  // Always format as XTZ since we're blockchain-only
  const formatAmount = (amount: number) => {
    return `${amount.toFixed(4)} XTZ`;
  };
  
  const winner = gameState.winner;
  const stats = getBettingStats(bettingState);
  
  const winningBets = bettingState.bettingHistory.filter(bet => bet.status === 'won');
  const hadWinningBet = winningBets.some(bet => bet.contestantId === winner?.id);

  return (
    <div className="space-y-8">
      {/* Winner Celebration */}
      {winner && (
        <div className="text-center bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 rounded-lg p-8">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-5xl font-bold text-yellow-500 mb-4">
            {winner.name} is the Sole Survivor!
          </h1>
          <p className="text-2xl text-white mb-4">
            The {winner.personality} {winner.trait} has conquered all challenges
          </p>
          <div className="bg-squid-dark rounded-lg p-4 inline-block">
            <p className="text-gray-300 italic">
              "{winner.description}"
            </p>
          </div>
        </div>
      )}

      {/* Your Performance */}
      <div className="bg-squid-gray rounded-lg p-6">
        <h2 className="text-3xl font-bold text-squid-pink mb-6">Your Performance</h2>
        
        {hadWinningBet ? (
          <div className="text-center bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-6 mb-6">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              Congratulations!
            </h3>
            <p className="text-white">
              You correctly predicted the winner and earned {formatAmount(stats.netProfit)}!
            </p>
          </div>
        ) : (
          <div className="text-center bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-6 mb-6">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-2xl font-bold text-red-400 mb-2">
              Better Luck Next Time
            </h3>
            <p className="text-white">
              Your chosen contestants didn't make it to the end.
            </p>
          </div>
        )}

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalBetsPlaced}
            </div>
            <div className="text-gray-400">Bets Placed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatAmount(stats.totalAmountBet)}
            </div>
            <div className="text-gray-400">Total Wagered</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {(stats.winRate * 100).toFixed(1)}%
            </div>
            <div className="text-gray-400">Win Rate</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.netProfit >= 0 ? '+' : ''}{formatAmount(stats.netProfit)}
            </div>
            <div className="text-gray-400">Net Profit</div>
          </div>
        </div>
      </div>

      {/* Game Highlights */}
      <div className="bg-squid-gray rounded-lg p-6">
        <h3 className="text-2xl font-bold text-squid-green mb-4">Game Highlights</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Most Dramatic Moments</h4>
            <div className="space-y-2">
              {gameState.roundNarrative.slice(-5).map((narrative, index) => (
                <p key={index} className="text-gray-300 text-sm">
                  • {narrative}
                </p>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-2">Final Rankings</h4>
            <div className="space-y-2">
              {gameState.contestants
                .sort((a, b) => {
                  if (a.status === 'winner') return -1;
                  if (b.status === 'winner') return 1;
                  if (a.status === 'alive' && b.status === 'eliminated') return -1;
                  if (a.status === 'eliminated' && b.status === 'alive') return 1;
                  return (b.roundsParticipated.length - a.roundsParticipated.length);
                })
                .slice(0, 5)
                .map((contestant, index) => (
                  <div key={contestant.id} className="flex justify-between items-center">
                    <span className="text-gray-300">
                      #{index + 1} {contestant.name} ({contestant.personality})
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      contestant.status === 'winner' ? 'bg-yellow-500 text-black' :
                      contestant.status === 'alive' ? 'bg-squid-green text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {contestant.status === 'winner' ? 'WINNER' :
                       contestant.status === 'alive' ? 'SURVIVOR' :
                       `Round ${gameState.rounds.findIndex(r => r.type === contestant.eliminationRound) + 1}`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final Balance */}
      <div className="bg-squid-dark rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Final Balance</h3>
        <div className="text-4xl font-bold text-squid-green">
          {walletState.isConnected ? `${parseFloat(walletState.balance).toFixed(4)} XTZ` : 'Connect Wallet'}
        </div>
        <p className="text-gray-400 mt-2">
          Check your wallet for final XTZ balance and any winnings from the blockchain game!
        </p>
      </div>

      {/* Play Again */}
      <div className="text-center space-y-4">
        <button 
          onClick={resetGame}
          className="game-button text-xl px-8 py-4"
        >
          Play Another Round
        </button>
        <p className="text-gray-400">
          Each game features different outcomes and strategies
        </p>
      </div>
    </div>
  );
}
