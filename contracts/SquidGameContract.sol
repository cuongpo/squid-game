// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SquidGameContract {
    struct Game {
        uint256 gameId;
        uint256 currentRound;
        uint256 totalRounds;
        bool isActive;
        string winner; // Contestant ID
        uint256 totalBetAmount;
        uint256 createdAt;
        uint256 completedAt;
        address creator;
    }

    struct Bet {
        uint256 betId;
        uint256 gameId;
        address bettor;
        string contestantId;
        uint256 amount;
        uint256 odds; // Multiplied by 100 (e.g., 250 = 2.5x)
        uint256 potentialPayout;
        uint256 timestamp;
        BetStatus status;
    }

    struct Contestant {
        string contestantId;
        string name;
        bool isAlive;
        uint256 totalBetsOnContestant;
    }

    enum BetStatus { Active, Won, Lost, Cancelled }

    // State variables
    uint256 public gameCounter;
    uint256 public betCounter;
    
    mapping(uint256 => Game) public games;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => mapping(string => Contestant)) public gameContestants;
    mapping(uint256 => uint256[]) public gameBets;
    mapping(address => uint256[]) public userBets;
    
    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 totalRounds);
    event BetPlaced(uint256 indexed betId, uint256 indexed gameId, address indexed bettor, string contestantId, uint256 amount);
    event GameCompleted(uint256 indexed gameId, string winner, uint256 totalPayout);
    event BetResolved(uint256 indexed betId, BetStatus status, uint256 payout);
    event RoundCompleted(uint256 indexed gameId, uint256 round, string[] eliminated);

    // Modifiers
    modifier gameExists(uint256 gameId) {
        require(games[gameId].gameId != 0, "Game does not exist");
        _;
    }

    modifier gameActive(uint256 gameId) {
        require(games[gameId].isActive, "Game is not active");
        _;
    }

    modifier onlyGameCreator(uint256 gameId) {
        require(games[gameId].creator == msg.sender, "Only game creator can perform this action");
        _;
    }

    // Create a new game
    function createGame(
        string[] memory contestantIds,
        string[] memory contestantNames,
        uint256 totalRounds
    ) external returns (uint256) {
        require(contestantIds.length == contestantNames.length, "Contestant arrays length mismatch");
        require(contestantIds.length > 0, "Must have at least one contestant");
        require(totalRounds > 0, "Must have at least one round");

        gameCounter++;
        uint256 gameId = gameCounter;

        games[gameId] = Game({
            gameId: gameId,
            currentRound: 0,
            totalRounds: totalRounds,
            isActive: true,
            winner: "",
            totalBetAmount: 0,
            createdAt: block.timestamp,
            completedAt: 0,
            creator: msg.sender
        });

        // Initialize contestants
        for (uint256 i = 0; i < contestantIds.length; i++) {
            gameContestants[gameId][contestantIds[i]] = Contestant({
                contestantId: contestantIds[i],
                name: contestantNames[i],
                isAlive: true,
                totalBetsOnContestant: 0
            });
        }

        emit GameCreated(gameId, msg.sender, totalRounds);
        return gameId;
    }

    // Place a bet on a contestant
    function placeBet(
        uint256 gameId,
        string memory contestantId,
        uint256 odds
    ) external payable gameExists(gameId) gameActive(gameId) {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(gameContestants[gameId][contestantId].isAlive, "Contestant is not alive");
        require(odds > 100, "Odds must be greater than 1.0 (100)");

        betCounter++;
        uint256 betId = betCounter;

        uint256 potentialPayout = (msg.value * odds) / 100;

        bets[betId] = Bet({
            betId: betId,
            gameId: gameId,
            bettor: msg.sender,
            contestantId: contestantId,
            amount: msg.value,
            odds: odds,
            potentialPayout: potentialPayout,
            timestamp: block.timestamp,
            status: BetStatus.Active
        });

        gameBets[gameId].push(betId);
        userBets[msg.sender].push(betId);
        
        games[gameId].totalBetAmount += msg.value;
        gameContestants[gameId][contestantId].totalBetsOnContestant += msg.value;

        emit BetPlaced(betId, gameId, msg.sender, contestantId, msg.value);
    }

    // Complete a round and eliminate contestants
    function completeRound(
        uint256 gameId,
        string[] memory eliminatedContestants
    ) external gameExists(gameId) gameActive(gameId) onlyGameCreator(gameId) {
        Game storage game = games[gameId];
        game.currentRound++;

        // Mark eliminated contestants as not alive
        for (uint256 i = 0; i < eliminatedContestants.length; i++) {
            gameContestants[gameId][eliminatedContestants[i]].isAlive = false;
        }

        emit RoundCompleted(gameId, game.currentRound, eliminatedContestants);

        // Check if game should end
        if (game.currentRound >= game.totalRounds) {
            _endGame(gameId);
        }
    }

    // End the game and declare winner
    function endGame(uint256 gameId, string memory winnerId) 
        external 
        gameExists(gameId) 
        gameActive(gameId) 
        onlyGameCreator(gameId) 
    {
        require(gameContestants[gameId][winnerId].isAlive, "Winner must be alive");
        games[gameId].winner = winnerId;
        _endGame(gameId);
    }

    // Internal function to end game and resolve bets
    function _endGame(uint256 gameId) internal {
        Game storage game = games[gameId];
        game.isActive = false;
        game.completedAt = block.timestamp;

        uint256 totalPayout = 0;

        // Resolve all bets for this game
        uint256[] memory gamesBets = gameBets[gameId];
        for (uint256 i = 0; i < gamesBets.length; i++) {
            uint256 betId = gamesBets[i];
            Bet storage bet = bets[betId];

            if (bet.status == BetStatus.Active) {
                if (keccak256(bytes(bet.contestantId)) == keccak256(bytes(game.winner))) {
                    // Winning bet
                    bet.status = BetStatus.Won;
                    totalPayout += bet.potentialPayout;
                    
                    // Transfer payout to bettor
                    (bool success, ) = payable(bet.bettor).call{value: bet.potentialPayout}("");
                    require(success, "Payout transfer failed");
                    
                    emit BetResolved(betId, BetStatus.Won, bet.potentialPayout);
                } else {
                    // Losing bet
                    bet.status = BetStatus.Lost;
                    emit BetResolved(betId, BetStatus.Lost, 0);
                }
            }
        }

        emit GameCompleted(gameId, game.winner, totalPayout);
    }

    // Get game details
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    // Get bet details
    function getBet(uint256 betId) external view returns (Bet memory) {
        return bets[betId];
    }

    // Get user's bets
    function getUserBets(address user) external view returns (uint256[] memory) {
        return userBets[user];
    }

    // Get game's bets
    function getGameBets(uint256 gameId) external view returns (uint256[] memory) {
        return gameBets[gameId];
    }

    // Get contestant info
    function getContestant(uint256 gameId, string memory contestantId) 
        external 
        view 
        returns (Contestant memory) 
    {
        return gameContestants[gameId][contestantId];
    }

    // Emergency withdraw (only contract owner)
    function emergencyWithdraw() external {
        require(msg.sender == address(this), "Only contract can withdraw");
        payable(msg.sender).transfer(address(this).balance);
    }
}
