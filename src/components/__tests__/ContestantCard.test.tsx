import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ContestantCard from '../ContestantCard'
import type { Contestant } from '../../types'

// Mock the game store
vi.mock('../../stores/gameStore', () => ({
  useGameStore: () => ({
    selectContestant: vi.fn()
  })
}))

// Mock the utility functions
vi.mock('../../utils/contestantUtils', () => ({
  getTotalStatPower: vi.fn(() => 35),
  getStrongestStats: vi.fn(() => ['intelligence', 'charisma'])
}))

vi.mock('../../utils/bettingSystem', () => ({
  formatOdds: vi.fn((odds) => `${odds}:1`),
  getImpliedProbability: vi.fn(() => 40)
}))

describe('ContestantCard', () => {
  let mockContestant: Contestant

  beforeEach(() => {
    mockContestant = {
      id: 'test-contestant',
      name: 'Test Player',
      personality: 'Cautious',
      trait: 'Survivor',
      description: 'A careful strategist who thinks before acting',
      status: 'alive',
      stats: {
        strength: 5,
        intelligence: 8,
        luck: 6,
        charisma: 7,
        agility: 4,
        deception: 3
      },
      relationships: {
        allies: [],
        enemies: [],
        neutral: []
      },
      roundsParticipated: [],
      currentOdds: 2.5,
      totalBetsPlaced: 0
    }
  })

  it('should render contestant basic information', () => {
    render(<ContestantCard contestant={mockContestant} />)
    
    expect(screen.getByText('Test Player')).toBeInTheDocument()
    expect(screen.getByText('Cautious')).toBeInTheDocument()
    expect(screen.getByText('Survivor')).toBeInTheDocument()
  })

  it('should display alive status correctly', () => {
    render(<ContestantCard contestant={mockContestant} />)
    
    expect(screen.getByText('Alive')).toBeInTheDocument()
  })

  it('should display eliminated status correctly', () => {
    const eliminatedContestant = {
      ...mockContestant,
      status: 'eliminated' as const,
      eliminationRound: 'Red Light Green Light' as const
    }
    
    render(<ContestantCard contestant={eliminatedContestant} />)
    
    expect(screen.getByText('Eliminated in Red Light Green Light')).toBeInTheDocument()
  })

  it('should display winner status correctly', () => {
    const winnerContestant = {
      ...mockContestant,
      status: 'winner' as const
    }
    
    render(<ContestantCard contestant={winnerContestant} />)
    
    expect(screen.getByText('Winner!')).toBeInTheDocument()
  })

  it('should show betting information when showBettingInfo is true', () => {
    render(<ContestantCard contestant={mockContestant} showBettingInfo={true} />)
    
    // Should show odds and probability
    expect(screen.getByText(/2.5:1/)).toBeInTheDocument()
    expect(screen.getByText('40.0')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('should not show betting information when showBettingInfo is false', () => {
    render(<ContestantCard contestant={mockContestant} showBettingInfo={false} />)
    
    // Should not show betting-specific elements
    expect(screen.queryByText(/2.5:1/)).not.toBeInTheDocument()
    expect(screen.queryByText(/40%/)).not.toBeInTheDocument()
  })

  it('should call onBetClick when bet button is clicked', () => {
    const mockOnBetClick = vi.fn()
    
    render(
      <ContestantCard 
        contestant={mockContestant} 
        showBettingInfo={true} 
        onBetClick={mockOnBetClick} 
      />
    )
    
    const betButton = screen.getByText(/Place Bet|Bet/)
    fireEvent.click(betButton)
    
    expect(mockOnBetClick).toHaveBeenCalledOnce()
  })

  it('should apply correct CSS classes based on status', () => {
    const { container } = render(<ContestantCard contestant={mockContestant} />)
    
    const card = container.querySelector('.contestant-card')
    expect(card).toHaveClass('border-squid-green') // alive status
  })

  it('should apply eliminated status styling', () => {
    const eliminatedContestant = {
      ...mockContestant,
      status: 'eliminated' as const
    }
    
    const { container } = render(<ContestantCard contestant={eliminatedContestant} />)
    
    const card = container.querySelector('.contestant-card')
    expect(card).toHaveClass('border-red-500') // eliminated status
  })

  it('should apply winner status styling', () => {
    const winnerContestant = {
      ...mockContestant,
      status: 'winner' as const
    }
    
    const { container } = render(<ContestantCard contestant={winnerContestant} />)
    
    const card = container.querySelector('.contestant-card')
    expect(card).toHaveClass('border-yellow-500') // winner status
  })

  it('should display contestant description', () => {
    render(<ContestantCard contestant={mockContestant} />)
    
    expect(screen.getByText('A careful strategist who thinks before acting')).toBeInTheDocument()
  })

  it('should handle missing elimination round gracefully', () => {
    const eliminatedContestant = {
      ...mockContestant,
      status: 'eliminated' as const
      // eliminationRound is undefined
    }
    
    render(<ContestantCard contestant={eliminatedContestant} />)
    
    expect(screen.getByText('Eliminated in undefined')).toBeInTheDocument()
  })
})
