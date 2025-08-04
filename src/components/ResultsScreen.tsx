import { useGameStore } from '../stores/gameStore';
import { useBlockchainStore } from '../stores/blockchainStore';
import { formatCurrency } from '../utils/bettingSystem';
import BlockchainGameStatus from './BlockchainGameStatus';

export default function ResultsScreen() {
  const { gameState, bettingState, resetGame } = useGameStore();
  const { blockchainBets, walletState } = useBlockchainStore();

  // Always format as XTZ since we're blockchain-only
  const formatAmount = (amount: number | string | undefined) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return `${numAmount.toFixed(4)} XTZ`;
  };

  const winner = gameState.winner;
  const survivors = gameState.survivors || (winner ? [winner] : []);
  const hasMultipleSurvivors = survivors.length > 1;

  // Use blockchain bets if available, otherwise fall back to local betting state
  const allBets = blockchainBets.length > 0 ? blockchainBets : bettingState.bettingHistory;
  const survivorIds = survivors.map(s => s.id);

  // Calculate results based on survivors
  let totalWinnings = 0;
  let totalLosses = 0;

  const processedBets = allBets.map(bet => {
    const betAmount = typeof bet.amount === 'string' ? parseFloat(bet.amount) : bet.amount;
    const betPayout = typeof bet.potentialPayout === 'string' ? parseFloat(bet.potentialPayout) : bet.potentialPayout;

    if (survivorIds.includes(bet.contestantId)) {
      // Winning bet - split among survivors if multiple
      const payout = hasMultipleSurvivors ?
        (betPayout || betAmount * 2.5) / survivors.length :
        (betPayout || betAmount * 2.5);
      totalWinnings += payout;
      return { ...bet, status: 'won', actualPayout: payout };
    } else {
      // Losing bet
      totalLosses += betAmount;
      return { ...bet, status: 'lost' };
    }
  });

  const winningBets = processedBets.filter(bet => bet.status === 'won');
  const losingBets = processedBets.filter(bet => bet.status === 'lost');
  const netProfit = totalWinnings - totalLosses;

  return (
    <div className="space-y-8">
      {/* Winner/Survivors Announcement */}
      {survivors.length > 0 && (
        <div className="text-center bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 rounded-lg p-8">
          <div className="text-6xl mb-4">{hasMultipleSurvivors ? '🤝' : '👑'}</div>
          <h2 className="text-4xl font-bold text-yellow-500 mb-4">
            {hasMultipleSurvivors ?
              `${survivors.length} Survivors!` :
              `${winner?.name} Wins!`
            }
          </h2>
          {hasMultipleSurvivors ? (
            <div>
              <p className="text-xl text-white mb-4">
                Multiple contestants survived the deadly games!
              </p>
              <div className="space-y-2">
                {survivors.map((survivor, index) => (
                  <p key={survivor.id} className="text-lg text-yellow-300">
                    {index + 1}. {survivor.name} - {survivor.personality} {survivor.trait}
                  </p>
                ))}
              </div>
            </div>
          ) : winner && (
            <div>
              <p className="text-xl text-white mb-2">
                The {winner.personality} {winner.trait} has survived all the deadly games.
              </p>
              <p className="text-gray-300">
                "{winner.description}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overall Result Summary */}
      <div className="text-center mb-8">
        {netProfit > 0 ? (
          <div className="bg-green-900 bg-opacity-30 border-2 border-green-500 rounded-lg p-6">
            <div className="text-5xl mb-4">💰</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">You Won!</h2>
            <p className="text-xl text-white mb-2">
              Congratulations! Your betting strategy paid off.
            </p>
            <p className="text-2xl font-bold text-green-400">
              Net Profit: +{formatAmount(netProfit)}
            </p>
          </div>
        ) : netProfit < 0 ? (
          <div className="bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg p-6">
            <div className="text-5xl mb-4">💸</div>
            <h2 className="text-3xl font-bold text-red-400 mb-2">You Lost</h2>
            <p className="text-xl text-white mb-2">
              Better luck next time! The games were unpredictable.
            </p>
            <p className="text-2xl font-bold text-red-400">
              Net Loss: {formatAmount(netProfit)}
            </p>
          </div>
        ) : (
          <div className="bg-gray-700 bg-opacity-30 border-2 border-gray-500 rounded-lg p-6">
            <div className="text-5xl mb-4">🤝</div>
            <h2 className="text-3xl font-bold text-gray-400 mb-2">Break Even</h2>
            <p className="text-xl text-white mb-2">
              You neither won nor lost money this round.
            </p>
            <p className="text-2xl font-bold text-gray-400">
              Net Result: {formatAmount(0)}
            </p>
          </div>
        )}
      </div>

      {/* Betting Results */}
      <div className="bg-squid-gray rounded-lg p-6">
        <h3 className="text-2xl font-bold text-squid-green mb-6">Detailed Betting Results</h3>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-squid-green">
              {formatAmount(totalWinnings)}
            </div>
            <div className="text-gray-400">Total Winnings</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">
              {formatAmount(totalLosses)}
            </div>
            <div className="text-gray-400">Total Losses</div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-squid-green' : 'text-red-500'}`}>
              {netProfit >= 0 ? '+' : ''}{formatAmount(netProfit)}
            </div>
            <div className="text-gray-400">Net Profit</div>
          </div>
        </div>

        {/* Bet Details */}
        {allBets.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Bet History</h4>
            {processedBets.map((bet) => {
              const contestant = gameState.contestants.find(c => c.id === bet.contestantId);
              const isWinner = bet.status === 'won';
              
              return (
                <div 
                  key={bet.id} 
                  className={`flex justify-between items-center p-4 rounded ${
                    isWinner ? 'bg-green-900 bg-opacity-30 border border-green-500' : 
                    'bg-red-900 bg-opacity-30 border border-red-500'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">
                      {contestant?.name} 
                      <span className={`ml-2 text-sm ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                        {isWinner ? '✓ WON' : '✗ LOST'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Bet: {formatAmount(bet.amount)} at {(bet.odds || 2.5).toFixed(1)}:1
                      {hasMultipleSurvivors && isWinner && (
                        <div className="text-xs text-yellow-400 mt-1">
                          🤝 Split among {survivors.length} survivors
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                      {isWinner ?
                        `+${formatAmount(bet.actualPayout || bet.potentialPayout || bet.amount * 2.5)}` :
                        `-${formatAmount(bet.amount)}`
                      }
                    </div>
                    {isWinner && bet.actualPayout && bet.actualPayout !== bet.potentialPayout && (
                      <div className="text-xs text-gray-400">
                        (Original: {formatAmount(bet.potentialPayout)})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {allBets.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            You didn't place any bets this round.
          </div>
        )}
      </div>

      {/* Game Summary */}
      <div className="bg-squid-gray rounded-lg p-6">
        <h3 className="text-2xl font-bold text-squid-green mb-4">Game Summary</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Final Standings</h4>
            <div className="space-y-2">
              {gameState.contestants
                .sort((a, b) => {
                  if (a.status === 'winner') return -1;
                  if (b.status === 'winner') return 1;
                  if (a.status === 'alive' && b.status === 'eliminated') return -1;
                  if (a.status === 'eliminated' && b.status === 'alive') return 1;
                  return 0;
                })
                .map((contestant, index) => (
                  <div key={contestant.id} className="flex justify-between items-center">
                    <span className="text-gray-300">
                      #{index + 1} {contestant.name}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      contestant.status === 'winner' ? 'bg-yellow-500 text-black' :
                      contestant.status === 'alive' ? 'bg-squid-green text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {contestant.status === 'winner' ? 'WINNER' :
                       contestant.status === 'alive' ? 'SURVIVOR' :
                       `Eliminated in ${contestant.eliminationRound}`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Game Status */}
      <BlockchainGameStatus />

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <button
          onClick={() => useGameStore.getState().setGamePhase('game-over')}
          className="bg-squid-pink hover:bg-squid-pink/80 text-white px-8 py-4 rounded text-xl font-semibold mr-4"
        >
          View Final Celebration
        </button>
        <button
          onClick={resetGame}
          className="game-button text-xl px-8 py-4"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
