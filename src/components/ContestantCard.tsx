import type { Contestant } from '../types/index';
import { useGameStore } from '../stores/gameStore';
import { getTotalStatPower, getStrongestStats } from '../utils/contestantUtils';
import { formatOdds, getImpliedProbability } from '../utils/bettingSystem';

interface ContestantCardProps {
  contestant: Contestant;
  showBettingInfo?: boolean;
  onBetClick?: () => void;
}

export default function ContestantCard({ 
  contestant, 
  showBettingInfo = false, 
  onBetClick 
}: ContestantCardProps) {
  const { selectContestant } = useGameStore();
  
  const totalPower = getTotalStatPower(contestant);
  const strongestStats = getStrongestStats(contestant, 2);
  const winProbability = getImpliedProbability(contestant.currentOdds);

  const getStatusColor = () => {
    switch (contestant.status) {
      case 'alive': return 'border-squid-green';
      case 'eliminated': return 'border-red-500';
      case 'winner': return 'border-yellow-500';
      default: return 'border-gray-600';
    }
  };

  const getStatusText = () => {
    switch (contestant.status) {
      case 'alive': return 'Alive';
      case 'eliminated': return `Eliminated in ${contestant.eliminationRound}`;
      case 'winner': return 'Winner!';
      default: return 'Unknown';
    }
  };

  return (
    <div
      className={`contestant-card cursor-pointer relative ${getStatusColor()}`}
      onClick={() => selectContestant(contestant.id)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-white">{contestant.name}</h3>
          <p className="text-sm text-gray-400">{contestant.personality}</p>
        </div>
        <div className="text-right">
          <div className={`text-xs px-2 py-1 rounded ${
            contestant.status === 'alive' ? 'bg-squid-green' :
            contestant.status === 'eliminated' ? 'bg-red-500' :
            'bg-yellow-500'
          } text-white`}>
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Trait */}
      <div className="mb-3">
        <span className="text-xs bg-squid-pink px-2 py-1 rounded text-white">
          {contestant.trait}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-4 line-clamp-3">
        {contestant.description}
      </p>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Power Level</span>
          <span className="text-white font-semibold">{totalPower}/60</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-squid-gradient h-2 rounded-full transition-all duration-300"
            style={{ width: `${(totalPower / 60) * 100}%` }}
          />
        </div>

        {/* Top Stats */}
        <div className="space-y-1">
          {strongestStats.map(({ stat, value }) => (
            <div key={stat} className="flex justify-between text-xs">
              <span className="text-gray-400 capitalize">{stat}</span>
              <span className="text-squid-green font-semibold">{value}/10</span>
            </div>
          ))}
        </div>
      </div>

      {/* Betting Info */}
      {showBettingInfo && contestant.status === 'alive' && (
        <div className="border-t border-gray-600 pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Odds</span>
            <span className="text-lg font-bold text-squid-green">
              {formatOdds(contestant.currentOdds)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Win Probability</span>
            <span className="text-sm text-white">
              {winProbability.toFixed(1)}%
            </span>
          </div>

          {onBetClick && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBetClick();
              }}
              className="bet-button w-full text-sm py-2"
            >
              Place Bet
            </button>
          )}
        </div>
      )}

      {/* Eliminated overlay */}
      {contestant.status === 'eliminated' && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">✕</div>
            <div className="text-white font-bold">ELIMINATED</div>
          </div>
        </div>
      )}

      {/* Winner overlay */}
      {contestant.status === 'winner' && (
        <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 flex items-center justify-center rounded-lg border-2 border-yellow-500">
          <div className="text-center">
            <div className="text-yellow-500 text-4xl mb-2">👑</div>
            <div className="text-yellow-500 font-bold">WINNER</div>
          </div>
        </div>
      )}
    </div>
  );
}
