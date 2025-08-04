import { useGameStore } from '../stores/gameStore';
import ContestantCard from './ContestantCard';
import OpenAIStatus from './OpenAIStatus';

export default function IntroScreen() {
  const { gameState, startGame } = useGameStore();

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-squid-pink">Meet the Contestants</h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Ten unique individuals, each with their own personality and survival strategy.
          Study their profiles carefully - your betting success depends on understanding
          who has what it takes to survive the deadly games.
        </p>

        {/* OpenAI Status */}
        <div className="flex justify-center">
          <OpenAIStatus />
        </div>
      </div>

      {/* Contestants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {gameState.contestants.map((contestant) => (
          <ContestantCard 
            key={contestant.id} 
            contestant={contestant} 
            showBettingInfo={false}
          />
        ))}
      </div>

      {/* Game Rules */}
      <div className="bg-squid-gray rounded-lg p-6 space-y-4">
        <h3 className="text-2xl font-bold text-squid-green">Game Rules</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">The Games</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>Red Light, Green Light:</strong> Speed and caution</li>
              <li>• <strong>Tug of War:</strong> Strength and teamwork</li>
              <li>• <strong>Marbles:</strong> Negotiation and deception</li>
              <li>• <strong>Glass Bridge:</strong> Risk-taking and observation</li>
              <li>• <strong>Squid Game:</strong> Final showdown</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Betting</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Place bets on who you think will win</li>
              <li>• Odds change based on contestant performance</li>
              <li>• Higher risk = higher potential rewards</li>
              <li>• Only one contestant can win it all</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button 
          onClick={startGame}
          className="game-button text-xl px-8 py-4"
        >
          Begin the Games
        </button>
      </div>
    </div>
  );
}
