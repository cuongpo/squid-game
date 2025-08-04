// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NarrativeContract {
    struct Narrative {
        uint256 narrativeId;
        uint256 gameId;
        uint256 round;
        string[] narrativeTexts;
        uint256 timestamp;
        address submitter;
    }

    struct GameEvent {
        uint256 eventId;
        uint256 gameId;
        uint256 round;
        string eventType; // 'elimination', 'alliance', 'betrayal', 'conflict', 'random'
        string description;
        string[] involvedContestants;
        uint256 timestamp;
        address submitter;
    }

    // State variables
    uint256 public narrativeCounter;
    uint256 public eventCounter;
    
    mapping(uint256 => Narrative) public narratives;
    mapping(uint256 => GameEvent) public gameEvents;
    mapping(uint256 => uint256[]) public gameNarratives; // gameId => narrativeIds[]
    mapping(uint256 => uint256[]) public gameEventsList; // gameId => eventIds[]
    mapping(uint256 => mapping(uint256 => uint256[])) public roundNarratives; // gameId => round => narrativeIds[]
    
    // Access control
    mapping(address => bool) public authorizedSubmitters;
    address public owner;

    // Events
    event NarrativeAdded(uint256 indexed narrativeId, uint256 indexed gameId, uint256 round, address submitter);
    event GameEventAdded(uint256 indexed eventId, uint256 indexed gameId, uint256 round, string eventType);
    event SubmitterAuthorized(address indexed submitter);
    event SubmitterRevoked(address indexed submitter);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedSubmitters[msg.sender] || msg.sender == owner, "Not authorized to submit");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedSubmitters[msg.sender] = true;
    }

    // Authorize an address to submit narratives
    function authorizeSubmitter(address submitter) external onlyOwner {
        authorizedSubmitters[submitter] = true;
        emit SubmitterAuthorized(submitter);
    }

    // Revoke authorization for an address
    function revokeSubmitter(address submitter) external onlyOwner {
        authorizedSubmitters[submitter] = false;
        emit SubmitterRevoked(submitter);
    }

    // Add a narrative for a specific game and round
    function addNarrative(
        uint256 gameId,
        uint256 round,
        string[] memory narrativeTexts
    ) external onlyAuthorized returns (uint256) {
        require(gameId > 0, "Invalid game ID");
        require(narrativeTexts.length > 0, "Narrative cannot be empty");

        narrativeCounter++;
        uint256 narrativeId = narrativeCounter;

        narratives[narrativeId] = Narrative({
            narrativeId: narrativeId,
            gameId: gameId,
            round: round,
            narrativeTexts: narrativeTexts,
            timestamp: block.timestamp,
            submitter: msg.sender
        });

        gameNarratives[gameId].push(narrativeId);
        roundNarratives[gameId][round].push(narrativeId);

        emit NarrativeAdded(narrativeId, gameId, round, msg.sender);
        return narrativeId;
    }

    // Add a game event
    function addGameEvent(
        uint256 gameId,
        uint256 round,
        string memory eventType,
        string memory description,
        string[] memory involvedContestants
    ) external onlyAuthorized returns (uint256) {
        require(gameId > 0, "Invalid game ID");
        require(bytes(eventType).length > 0, "Event type cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        eventCounter++;
        uint256 eventId = eventCounter;

        gameEvents[eventId] = GameEvent({
            eventId: eventId,
            gameId: gameId,
            round: round,
            eventType: eventType,
            description: description,
            involvedContestants: involvedContestants,
            timestamp: block.timestamp,
            submitter: msg.sender
        });

        gameEventsList[gameId].push(eventId);

        emit GameEventAdded(eventId, gameId, round, eventType);
        return eventId;
    }

    // Get narrative by ID
    function getNarrative(uint256 narrativeId) external view returns (Narrative memory) {
        return narratives[narrativeId];
    }

    // Get game event by ID
    function getGameEvent(uint256 eventId) external view returns (GameEvent memory) {
        return gameEvents[eventId];
    }

    // Get all narratives for a game
    function getGameNarratives(uint256 gameId) external view returns (uint256[] memory) {
        return gameNarratives[gameId];
    }

    // Get all events for a game
    function getGameEvents(uint256 gameId) external view returns (uint256[] memory) {
        return gameEventsList[gameId];
    }

    // Get narratives for a specific round
    function getRoundNarratives(uint256 gameId, uint256 round) external view returns (uint256[] memory) {
        return roundNarratives[gameId][round];
    }

    // Get narrative texts (helper function to avoid struct return issues)
    function getNarrativeTexts(uint256 narrativeId) external view returns (string[] memory) {
        return narratives[narrativeId].narrativeTexts;
    }

    // Get involved contestants for an event (helper function)
    function getEventContestants(uint256 eventId) external view returns (string[] memory) {
        return gameEvents[eventId].involvedContestants;
    }

    // Batch add multiple narratives for efficiency
    function addMultipleNarratives(
        uint256 gameId,
        uint256 round,
        string[][] memory narrativeTextsBatch
    ) external onlyAuthorized returns (uint256[] memory) {
        require(gameId > 0, "Invalid game ID");
        require(narrativeTextsBatch.length > 0, "No narratives provided");

        uint256[] memory narrativeIds = new uint256[](narrativeTextsBatch.length);

        for (uint256 i = 0; i < narrativeTextsBatch.length; i++) {
            require(narrativeTextsBatch[i].length > 0, "Narrative cannot be empty");

            narrativeCounter++;
            uint256 narrativeId = narrativeCounter;

            narratives[narrativeId] = Narrative({
                narrativeId: narrativeId,
                gameId: gameId,
                round: round,
                narrativeTexts: narrativeTextsBatch[i],
                timestamp: block.timestamp,
                submitter: msg.sender
            });

            gameNarratives[gameId].push(narrativeId);
            roundNarratives[gameId][round].push(narrativeId);
            narrativeIds[i] = narrativeId;

            emit NarrativeAdded(narrativeId, gameId, round, msg.sender);
        }

        return narrativeIds;
    }

    // Get total number of narratives for a game
    function getGameNarrativeCount(uint256 gameId) external view returns (uint256) {
        return gameNarratives[gameId].length;
    }

    // Get total number of events for a game
    function getGameEventCount(uint256 gameId) external view returns (uint256) {
        return gameEventsList[gameId].length;
    }

    // Transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
        authorizedSubmitters[newOwner] = true;
    }
}
