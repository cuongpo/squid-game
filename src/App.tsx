import { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import IntroScreen from './components/IntroScreen';
import BettingScreen from './components/BettingScreen';
import SimulationScreen from './components/SimulationScreen';
import ResultsScreen from './components/ResultsScreen';
import GameOverScreen from './components/GameOverScreen';
import WalletConnection from './components/WalletConnection';
import TransactionStatus from './components/TransactionStatus';
import NetworkStatus from './components/NetworkStatus';
import './utils/testGame'; // Load test functions
import './utils/testMainnetConfig'; // Test mainnet configuration

function App() {
  const { uiState, initializeGame } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const renderCurrentScreen = () => {
    switch (uiState.currentPhase) {
      case 'intro':
        return <IntroScreen />;
      case 'betting':
        return <BettingScreen />;
      case 'simulation':
        return <SimulationScreen />;
      case 'results':
        return <ResultsScreen />;
      case 'game-over':
        return <GameOverScreen />;
      default:
        return <IntroScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-squid-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold squid-gradient bg-clip-text text-transparent mb-4">
            Squid Game Simulator
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Blockchain-powered betting with XTZ on Etherlink testnet
          </p>
          <p className="text-sm text-gray-400 mb-6">
            🔗 All bets, narratives, and results stored permanently onchain
          </p>

          {/* Wallet Connection */}
          <div className="mt-6 max-w-md mx-auto">
            <WalletConnection />
          </div>
        </header>

        <main>
          {renderCurrentScreen()}
        </main>
      </div>

      {/* Transaction Status Notifications */}
      <TransactionStatus />

      {/* Network Status Indicator */}
      <NetworkStatus />
    </div>
  );
}

export default App;
