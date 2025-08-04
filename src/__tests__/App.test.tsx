import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

// Mock all the screen components
vi.mock('../components/IntroScreen', () => ({
  default: () => <div data-testid="intro-screen">Intro Screen</div>
}))

vi.mock('../components/BettingScreen', () => ({
  default: () => <div data-testid="betting-screen">Betting Screen</div>
}))

vi.mock('../components/SimulationScreen', () => ({
  default: () => <div data-testid="simulation-screen">Simulation Screen</div>
}))

vi.mock('../components/ResultsScreen', () => ({
  default: () => <div data-testid="results-screen">Results Screen</div>
}))

vi.mock('../components/GameOverScreen', () => ({
  default: () => <div data-testid="game-over-screen">Game Over Screen</div>
}))

// Mock the test game utility
vi.mock('../utils/testGame', () => ({}))

// Mock the game store
const mockGameStore = {
  uiState: { currentPhase: 'intro' },
  initializeGame: vi.fn()
}

vi.mock('../stores/gameStore', () => ({
  useGameStore: () => mockGameStore
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGameStore.uiState.currentPhase = 'intro'
  })

  it('should render the main layout structure', () => {
    render(<App />)
    
    expect(screen.getByText('Squid Game Simulator')).toBeInTheDocument()
    expect(screen.getByText('Place your bets and watch the deadly games unfold')).toBeInTheDocument()
  })

  it('should initialize the game on mount', () => {
    render(<App />)
    
    expect(mockGameStore.initializeGame).toHaveBeenCalledOnce()
  })

  it('should render IntroScreen when phase is intro', () => {
    mockGameStore.uiState.currentPhase = 'intro'
    render(<App />)
    
    expect(screen.getByTestId('intro-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('betting-screen')).not.toBeInTheDocument()
  })

  it('should render BettingScreen when phase is betting', () => {
    mockGameStore.uiState.currentPhase = 'betting'
    render(<App />)
    
    expect(screen.getByTestId('betting-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('intro-screen')).not.toBeInTheDocument()
  })

  it('should render SimulationScreen when phase is simulation', () => {
    mockGameStore.uiState.currentPhase = 'simulation'
    render(<App />)
    
    expect(screen.getByTestId('simulation-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('betting-screen')).not.toBeInTheDocument()
  })

  it('should render ResultsScreen when phase is results', () => {
    mockGameStore.uiState.currentPhase = 'results'
    render(<App />)
    
    expect(screen.getByTestId('results-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('simulation-screen')).not.toBeInTheDocument()
  })

  it('should render GameOverScreen when phase is game-over', () => {
    mockGameStore.uiState.currentPhase = 'game-over'
    render(<App />)
    
    expect(screen.getByTestId('game-over-screen')).toBeInTheDocument()
    expect(screen.queryByTestId('results-screen')).not.toBeInTheDocument()
  })

  it('should default to IntroScreen for unknown phase', () => {
    mockGameStore.uiState.currentPhase = 'unknown-phase' as any
    render(<App />)
    
    expect(screen.getByTestId('intro-screen')).toBeInTheDocument()
  })

  it('should have correct CSS classes for styling', () => {
    const { container } = render(<App />)
    
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-squid-dark', 'text-white')
    
    const containerDiv = mainDiv.firstChild as HTMLElement
    expect(containerDiv).toHaveClass('container', 'mx-auto', 'px-4', 'py-8')
  })

  it('should render header with correct styling', () => {
    render(<App />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('text-center', 'mb-8')
    
    const title = screen.getByText('Squid Game Simulator')
    expect(title).toHaveClass('text-4xl', 'md:text-6xl', 'font-bold', 'squid-gradient', 'bg-clip-text', 'text-transparent', 'mb-4')
    
    const subtitle = screen.getByText('Place your bets and watch the deadly games unfold')
    expect(subtitle).toHaveClass('text-xl', 'text-gray-300')
  })

  it('should render main content area', () => {
    render(<App />)
    
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toContainElement(screen.getByTestId('intro-screen'))
  })

  describe('responsive design', () => {
    it('should have responsive title classes', () => {
      render(<App />)
      
      const title = screen.getByText('Squid Game Simulator')
      expect(title).toHaveClass('text-4xl', 'md:text-6xl')
    })

    it('should have responsive container padding', () => {
      const { container } = render(<App />)
      
      const containerDiv = container.querySelector('.container')
      expect(containerDiv).toHaveClass('px-4', 'py-8')
    })
  })

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<App />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument() // header
      expect(screen.getByRole('main')).toBeInTheDocument() // main
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument() // h1
    })

    it('should have descriptive text content', () => {
      render(<App />)
      
      expect(screen.getByText('Squid Game Simulator')).toBeInTheDocument()
      expect(screen.getByText('Place your bets and watch the deadly games unfold')).toBeInTheDocument()
    })
  })
})
