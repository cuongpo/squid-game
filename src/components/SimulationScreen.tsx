import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import ContestantCard from './ContestantCard';
import { Play, Pause, SkipForward } from 'lucide-react';

export default function SimulationScreen() {
  const {
    gameState,
    simulateNextRound,
    isGameComplete,
    setSimulationSpeed,
    setGamePhase,
    uiState,
    completeNarrative,
    resetRoundState
  } = useGameStore();

  const [isAutoPlaying, setIsAutoPlaying] = useState(true); // Start auto-playing by default
  const [currentNarrativeIndex, setCurrentNarrativeIndex] = useState(0);

  const aliveContestants = gameState.contestants.filter(c => c.status === 'alive');
  const currentRound = gameState.currentRoundData;
  
  // Auto-advance narrative
  useEffect(() => {
    if (gameState.roundNarrative.length > currentNarrativeIndex) {
      const timer = setTimeout(() => {
        const newIndex = Math.min(currentNarrativeIndex + 1, gameState.roundNarrative.length);
        setCurrentNarrativeIndex(newIndex);

        // If we've reached the end of the current narrative and there's a pending round result
        if (newIndex === gameState.roundNarrative.length &&
            gameState.pendingRoundResult &&
            !uiState.narrativeComplete) {
          // Complete the narrative after a short delay
          setTimeout(() => {
            completeNarrative();
          }, 1500);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [gameState.roundNarrative.length, currentNarrativeIndex, gameState.pendingRoundResult, uiState.narrativeComplete, completeNarrative]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isGameComplete()) {
      const delay = uiState.simulationSpeed === 'fast' ? 1000 : 
                   uiState.simulationSpeed === 'slow' ? 5000 : 3000;
      
      const timer = setTimeout(() => {
        simulateNextRound();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying, isGameComplete, simulateNextRound, uiState.simulationSpeed]);

  // Auto-transition to results when game is complete
  useEffect(() => {
    const gameComplete = isGameComplete();
    const hasWinner = !!gameState.winner;
    const aliveCount = gameState.contestants.filter(c => c.status === 'alive').length;

    console.log('Game status check:', {
      gameComplete,
      hasWinner,
      aliveCount,
      currentRound: gameState.currentRound,
      totalRounds: gameState.totalRounds,
      currentPhase: uiState.currentPhase
    });

    if (gameComplete && uiState.currentPhase === 'simulation') {
      // Wait a moment to show the final state, then transition to results
      const timer = setTimeout(() => {
        console.log('Auto-transitioning to results screen...');
        setGamePhase('results');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isGameComplete, gameState.winner, gameState.contestants, gameState.currentRound, gameState.totalRounds, uiState.currentPhase, setGamePhase]);

  const handlePlayPause = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleNextRound = () => {
    if (!isGameComplete()) {
      // Reset round state before starting new round
      resetRoundState();
      simulateNextRound();
      setCurrentNarrativeIndex(0);
    }
  };

  const getSpeedButtonClass = (speed: string) => {
    return `px-3 py-1 rounded text-sm ${
      uiState.simulationSpeed === speed 
        ? 'bg-squid-pink text-white' 
        : 'bg-squid-dark text-gray-300 hover:bg-gray-600'
    }`;
  };

  return (
    <div className="space-y-8">
      {/* Game Progress */}
      <div className="bg-squid-gray rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-squid-pink">
            {currentRound ? currentRound.name : 'Game Complete'}
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-400">Round</div>
            <div className="text-xl font-bold text-white">
              {gameState.currentRound} / {gameState.totalRounds}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-squid-gradient h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${(gameState.currentRound / gameState.totalRounds) * 100}%` 
            }}
          />
        </div>

        {/* Round Description */}
        {currentRound && (
          <p className="text-gray-300">{currentRound.description}</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={handlePlayPause}
          disabled={isGameComplete()}
          className="flex items-center space-x-2 game-button disabled:opacity-50"
        >
          {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
          <span>{isAutoPlaying ? 'Pause' : 'Auto Play'}</span>
        </button>

        <button
          onClick={handleNextRound}
          disabled={isGameComplete()}
          className="flex items-center space-x-2 bg-squid-green hover:bg-squid-green/80 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          <SkipForward size={20} />
          <span>Next Round</span>
        </button>

        {/* Speed Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Speed:</span>
          <button
            onClick={() => setSimulationSpeed('slow')}
            className={getSpeedButtonClass('slow')}
          >
            Slow
          </button>
          <button
            onClick={() => setSimulationSpeed('normal')}
            className={getSpeedButtonClass('normal')}
          >
            Normal
          </button>
          <button
            onClick={() => setSimulationSpeed('fast')}
            className={getSpeedButtonClass('fast')}
          >
            Fast
          </button>
        </div>
      </div>

      {/* Narrative Display */}
      {gameState.roundNarrative.length > 0 && (
        <div className="bg-squid-dark rounded-lg p-6">
          <h3 className="text-xl font-bold text-squid-green mb-4">Game Narrative</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {gameState.roundNarrative.slice(0, currentNarrativeIndex).map((text, index) => (
              <p 
                key={index} 
                className="text-gray-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Contestants Status */}
      <div className="space-y-6">
        {/* Show message if no rounds have been played yet */}
        {gameState.currentRound === 0 && (
          <div className="text-center bg-squid-gray rounded-lg p-8">
            <h3 className="text-xl font-bold text-squid-pink mb-4">Ready to Begin</h3>
            <p className="text-gray-300 mb-4">
              The games are about to start. Click "Next Round" to begin the first deadly challenge!
            </p>
          </div>
        )}

        {/* Alive Contestants */}
        {aliveContestants.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-squid-green mb-4">
              Remaining Contestants ({aliveContestants.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {aliveContestants.map((contestant) => (
                <ContestantCard
                  key={contestant.id}
                  contestant={contestant}
                  showBettingInfo={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Eliminated Contestants - Only show when eliminations should be visible */}
        {gameState.eliminatedContestants.length > 0 && uiState.showEliminations && (
          <div>
            <h3 className="text-xl font-bold text-red-500 mb-4">
              Eliminated ({gameState.eliminatedContestants.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 opacity-60">
              {gameState.eliminatedContestants.map((contestant) => (
                <ContestantCard
                  key={contestant.id}
                  contestant={contestant}
                />
              ))}
            </div>
          </div>
        )}

        {/* Round in Progress Indicator */}
        {uiState.roundInProgress && !uiState.showEliminations && (
          <div className="text-center bg-squid-gray rounded-lg p-6">
            <div className="animate-pulse">
              <h3 className="text-xl font-bold text-squid-pink mb-2">Round in Progress...</h3>
              <p className="text-gray-300">
                {uiState.narrativeComplete ?
                  "Determining eliminations..." :
                  "Watch the narrative unfold..."
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Game Complete Message */}
      {isGameComplete() && gameState.winner && (
        <div className="text-center bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-yellow-500 mb-4">
            🎉 We Have a Winner! 🎉
          </h2>
          <p className="text-xl text-white">
            {gameState.winner.name} has survived all the games!
          </p>
        </div>
      )}
    </div>
  );
}
