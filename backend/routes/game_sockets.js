const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Game = require("../models/game");
const Player = require("../models/player");
// const socketIO = require("socket.io");
const http = require("http");
// use websocket
const WebSocket = require("ws");

const app = express();
let server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// make an array of default of positions of players
let defaultPositions = [
    { x: 5, y: 3, direction: 0 },
    { x: 6, y: 10, direction: 1 },
    { x: 2, y: 10, direction: 1 },
    { x: 8, y: 4, direction: 0 },
];

// make an array of default of positions of bullets
let defaultBullets = [
    { x: 1, y: 1 },
    { x: 10, y: 14 },
    { x: 10, y: 1 },
    { x: 1, y: 14 },
    { x: 3, y: 6 },
    { x: 1, y: 6 },
];

// make an array of default of positions of pellets
let defaultPellets = [
    { x: 9, y: 1 },
    { x: 4, y: 14 },
    { x: 7, y: 13 },
    { x: 9, y: 9 },
    { x: 10, y: 4 },
    { x: 2, y: 3 },
];


// when a new connection is made
wss.on("connection", ws => {
    // when a message is received
    // give each player a random id
    let playerId = Math.floor(Math.random() * 1000000000);
    ws.playerId = playerId;

    ws.on("message", message => {
        // parse the message
        const data = JSON.parse(message);
        // check the type of message
        switch (data.type) {
            // when a player joins a game
            case "joinGame":
                Game
                    .findOneAndUpdate({
                        id: data
                            .game.gameId
                    }, {
                        $push: {
                            players: {
                                id: data.playerId,
                                score: 0,
                                bullets: 0,
                                health: 3,
                                x: defaultPositions[game.players.length].x,
                                y: defaultPositions[game.players.length].y,
                                direction: defaultPositions[game.players.length].direction,
                            }
                        },
                        $push: {
                            players_ids: ws.playerId
                        }

                    }, {
                        new: true
                    })
                    .exec()
                    .then(game => {
                        // emit the game to all players in the game
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                client.send(JSON.stringify({
                                    type: "gameJoined",
                                    game: game
                                }));
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;
            // when player makes a move
            case "move":
                // find the game
                Game
                    .findOneAndUpdate({
                        id: data

                            .game.gameId
                    }, {
                        $set: {
                            "players.$[player].x": data.player.x,
                            "players.$[player].y": data.player.y,
                            "players.$[player].direction": data.player.direction,
                        }
                    }, {
                        arrayFilters: [{
                            "player.id": data.playerId
                        }],
                        new: true
                    })
                    .exec()
                    .then(game => {
                        // emit the game to all players in the game
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                client.send(JSON.stringify({
                                    type: "gameUpdated",
                                    game: game
                                }));
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;
            case "removeBullet":
                Game
                    .findOneAndUpdate({
                        id: data

                            .game.gameId
                    }, {
                        // remove 
                        $pull: {
                            "bullets": { x: data.bullet.x, y: data.bullet.y }
                        }
                    }, {
                        new: true
                    })
                    .exec()
                    .then(game => {
                        // emit the game to all players in the game
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                client.send(JSON.stringify({
                                    type: "gameUpdated",
                                    game: game
                                }));
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });



                break;
            // same but for pellets
            case "removePellet":
                Game
                    .findOneAndUpdate({
                        id: data
                            .game.gameId
                    }, {
                        $pull: {
                            "pellets": { x: data.pellet.x, y: data.pellet.y }
                        }
                    }, {
                        new: true
                    })
                    .exec()
                    .then(game => {
                        // emit the game to all players in the game
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                client.send(JSON.stringify({
                                    type: "gameUpdated",
                                    game: game
                                }));
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });


                break;
            // updateBullets
            case "updateBullets":
                // update the bullets that player has
                Game
                    .findOneAndUpdate({
                        id: data
                            .game.gameId
                    }, {
                        $set: {
                            "players.$[player].bullets": data.player.bullets
                        }
                    }, {
                        arrayFilters: [{
                            "player.id": data.playerId
                        }],
                        new: true
                    })
                    .exec()
                    .then(game => {
                        // emit the game to all players in the game
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                client.send(JSON.stringify({
                                    type: "gameUpdated",
                                    game: game
                                }));
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });

                break;
            // updateScore
            case "updateScore":
                // update the score of the player
                Game
                    .findOneAndUpdate({
                        id: data
                            .game.gameId
                    }, {
                        $set: {
                            "players.$[player].score": data.player.score
                        }
                    }, {
                        arrayFilters: [{
                            "player.id": data.playerId
                        }],
                        new: true
                    })
                    .exec()
                    .then(game => {
                        // emit the game to all players in the game
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                client.send(JSON.stringify({
                                    type: "gameUpdated",
                                    game: game
                                }));
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });

                break;

            case "shoot":
                Game
                    .findOneAndUpdate({
                        id: data
                            .game.gameId
                    }, {
                        $set: {
                            "players.$[player].bullets": data.player.bullets - 1
                        }
                    }, {
                        arrayFilters: [{
                            "player.id": data.playerId
                        }],
                        new: true
                    })
                    .exec()
                    .then(game => {
                        // emit the game to all players in the game
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                if (client.playerId !== ws.playerId) {
                                    client.send(JSON.stringify({
                                        type: "shoot",
                                        x: data.x,
                                        y: data.y,
                                        direction: data.direction,
                                    }));
                                }
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;

            case "playerHit":
                Game
                    .findOneAndUpdate({
                        id: data
                            .game.gameId
                    }, {
                        $set: {
                            "players.$[player].health": "players.$[player].health - 1",
                            "state": "players.$[player].health === 1 && players.length === 2 ? 'finished' : state",
                        },
                        $pull: {
                            $cond: [{
                                $eq: ["players.$[player].health", 0]
                            }, {
                                players_ids: ws.playerId,
                                players: {
                                    id: data.playerId
                                }
                            }]
                        },
                    }, {
                        arrayFilters: [{
                            "player.id": data.playerId
                        }],
                        new: false
                    })
                    .exec()
                    .then(game => {
                        // emit the game to all players in the game
                        // if the player with the id health is 0, then the player is dead
                        for (let i = 0; i < game.players.length; i++) {
                            if (game.players[i].id === data.playerId) {
                                if (game.players[i].health === 1) {
                                    if (game.players.length === 2) {
                                        wss.clients.forEach(client => {
                                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                                if (ws.playerId != client.playerId) {
                                                    client.send(JSON.stringify({
                                                        type: "gameWon",
                                                        game: result,
                                                    }));
                                                }
                                            }
                                        });
                                    } else {
                                        wss.clients.forEach(client => {
                                            if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                                client.send(JSON.stringify({
                                                    type: "playerDied",
                                                    player: data.playerId,
                                                }));
                                            }
                                        });
                                    }
                                } else {
                                    wss.clients.forEach(client => {
                                        if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                            client.send(JSON.stringify({
                                                type: "gameUpdate",
                                                game: result,
                                            }));
                                        }
                                    });
                                }
                            }
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });

                break;
            default:
                break;
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");

        Game
            .findOneAndUpdate({
                players_ids: ws.playerId
            }, {
                $pull: {
                    players_ids: ws.playerId
                }
            }, {
                new: true
            })
            .exec()
            .then(game => {
                if (game.players_ids.length === 0) {
                    // delete the game
                    game
                        .remove()
                        .then(result => {
                            console.log("Game deleted");
                        })
                        .catch(err => {
                            console.log(err);
                        });
                } else {
                    game.save()
                        .then(result => {
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                                    client.send(JSON.stringify({
                                        type: "gameUpdated",
                                        game: result,
                                    }));
                                }
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
            }
            )
            .catch(err => {
                console.log(err);
            }
            );
    });

    // every 3000ms, add a new random bullet and pellet to the game and emit the game to all players in the game
    setInterval(() => {
        Game
            .findOneAndUpdate({
                state: "playing",
            }, {
                $set: {
                    bullets: {
                        $cond: {
                            if: {
                                $lt: [
                                    {
                                        $size: "$bullets"
                                    },
                                    3
                                ]
                            },
                            then: {
                                $push: [
                                    "$bullets",
                                    {
                                        $arrayElemAt: [
                                            defaultBullets,
                                            {
                                                $rand: {}
                                            }
                                        ]
                                    }
                                ]
                            },
                            else: "$bullets"
                        }
                    },
                    pellets: {
                        $cond: {
                            if: {
                                $lt: [
                                    {
                                        $size: "$pellets"
                                    },
                                    2
                                ]
                            },
                            then: {
                                $push: [
                                    "$pellets",
                                    {
                                        $arrayElemAt: [
                                            defaultPellets,
                                            {
                                                $rand: {}
                                            }
                                        ]
                                    }
                                ]
                            },
                            else: "$pellets"
                        }
                    }
                }
            }, {
                new: true,
            })
            .exec()
            .then(game => {
                if (game) {
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN && game.players_ids.includes(client.playerId)) {
                            client.send(JSON.stringify({
                                type: "gameUpdated",
                                game: game,
                            }));
                        }
                    });
                }
            }
            )
            .catch(err => {
                console.log(err);
            }
            );

    }, 3000);

    ws.send('Hi there, I am a WebSocket server');
});

module.exports = wss;