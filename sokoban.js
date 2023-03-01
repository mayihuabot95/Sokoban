"use strict";


// The map of the current level, which is made up of 12*12 blocks, each of which is a square of 50px in size.
var currentGameMap; 
// The Original data for the current game map
var CURRENT_GAME_MAP; 
// Define a variable to store the level of the current game map
var currentLevel;
// Define a variable to count the number of moves
var moveCount; 
// Define a variable to store the images data
var imageMapping; 
// Define a variable to store the position and direction of the man
var manLocation = {
    x: 0, 
    y: 0, 
    position: 'down'
}; 
var gameInfo1,
    gameInfoRecord;
// Define a variable to store the drawing environment
var ctx;
// Define the variables to store the width and height of the block and the size of current map
var BLOCK_WIDTH,
    BLOCK_HEIGHT,
    WIDTH_SIZE,
    HEIGHT_SIZE;
var BLOCK_ENUM;
var minimumMoveCount;
var levelOneRecord,
    levelTwoRecord,
    levelThreeRecord,
    levelFourRecord,
    levelFiveRecord,
    levelSixRecord;
var gameLevelChoice;


window.onload = function () {
    // Get the dom object representing the canvas
    var canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext('2d');
    gameInfo1 = document.getElementById('game-info1');
    gameInfoRecord = document.getElementById('game-info-record');
    BLOCK_WIDTH = 50, BLOCK_HEIGHT = 50, WIDTH_SIZE = 12, HEIGHT_SIZE = 12;
    BLOCK_ENUM = {
        // Define the constants for the current level
        background: 0,
        floor: 6,
        wall: 1,
        point: 2,
        box: 3,
        player: 4,
        box_ok: 5
    }; 
    
    initGame(0);
    showGameChoice();

    function  showGameInfo() {
        gameInfo1.innerText  = 'Level: ' + (currentLevel + 1) + ' Number of moves: ' + moveCount;
        switch(currentLevel) {
            case 0:
                // If the player has not played this level then the record is displayed as none, otherwise the record is obtained from the localStorage and displayed
                levelOneRecord = localStorage.getItem("levelOneRecord") == null ? 'none' : localStorage.getItem("levelOneRecord") + ' steps';
                gameInfoRecord.innerText  = levelOneRecord;
                break;
            case 1:
                levelTwoRecord = localStorage.getItem("levelTwoRecord") == null ? 'none' : localStorage.getItem("levelTwoRecord") + ' steps';
                gameInfoRecord.innerText  = levelTwoRecord;
                break;
            case 2:
                levelThreeRecord = localStorage.getItem("levelThreeRecord") == null ? 'none' : localStorage.getItem("levelThreeRecord") + ' steps';
                gameInfoRecord.innerText  = levelThreeRecord;
                break;
            case 3:
                levelFourRecord = localStorage.getItem("levelFourRecord") == null ? 'none' : localStorage.getItem("levelFourRecord") + ' steps';
                gameInfoRecord.innerText  = levelFourRecord;
                break;
            case 4:
                levelFiveRecord = localStorage.getItem("levelFiveRecord") == null ? 'none' : localStorage.getItem("levelFiveRecord") + ' steps';
                gameInfoRecord.innerText  = levelFiveRecord;
                break;
            case 5:
                levelSixRecord = localStorage.getItem("levelSixRecord") == null ? 'none' : localStorage.getItem("levelSixRecord") + ' steps';
                gameInfoRecord.innerText  = levelSixRecord;
                break;
        }
    }

    function showGameChoice() {
        gameLevelChoice = document.getElementById("game-level-choice");
        for(var i = 0; i < gameMap.length; i++) {
            var btn = document.createElement("button");
            btn.style.width = "80px";
            btn.style.height = "40px";
            btn.style.backgroundColor = "gray";
            btn.style.color = "white";
            btn.innerText = "Level" + (i + 1);
            btn.classList.add('flex-item');
            btn.id = i;
            gameLevelChoice.appendChild(btn);
            btn.addEventListener('click', function() {
                console.log("moveCount: " + moveCount);
                switch(this.id) {
                    case "0":
                        homePage.style.display = 'none';
                        gameBoxWrap.style.display = 'block';
                        initGame(0);
                        break;
                    case "1":
                        homePage.style.display = 'none';
                        gameBoxWrap.style.display = 'block';
                        initGame(1);
                        break;
                    case "2":
                        homePage.style.display = 'none';
                        gameBoxWrap.style.display = 'block';
                        initGame(2);
                        break;
                    case "3":
                        homePage.style.display = 'none';
                        gameBoxWrap.style.display = 'block';
                        initGame(3);
                        break;
                    case "4":
                        homePage.style.display = 'none';
                        gameBoxWrap.style.display = 'block';
                        initGame(4);
                        break;
                    case "5":
                        homePage.style.display = 'none';
                        gameBoxWrap.style.display = 'block';
                        initGame(5);
                        break;
                }
            })
        }
    }

    // The images resource must be loaded before it can be used, so the following callback function is used here to initialize the map
    function loadImage(srcs, callback) {
        // Number of images that are already preloaded
        var loadedCount = 0; 
        // Number of images to be preloaded
        var imgCount = 0; 
        for (var count in imageMapping) {
            imgCount++;
        }
        for (var key in imageMapping) {
            // Check the keys of the object named imageMapping
            if(imageMapping.hasOwnProperty(key)){ 
                var src = imageMapping[key];
                imageMapping[key] = new Image();
                imageMapping[key].src = src;
                imageMapping[key].onload = function () {
                    // Determine if all images have been preloaded
                    if (++loadedCount >= imgCount && callback instanceof Function) {
                        callback();
                    }
                }
            }
        }
    }
    
    function initGame(level) {
        if (level >= gameMap.length) {
            alert('Congratulations, you have passed all the levels!!!');
            return;
        }
        // Initializing the map level
        currentLevel = level; 
        // Initialize the number of moves
        moveCount = 0; 
        // Create image data source
        imageMapping = {
            floor: 'images/floorBrick.png',
            wall: 'images/wallBrick.png',
            point: 'images/drop_point.png',
            box: 'images/box1.png',
            player: 'images/player.png',
            box_ok: 'images/box2.png'
        }; 
        // Initialize the game map data
        currentGameMap = gameMap[currentLevel]; 
        CURRENT_GAME_MAP = JSON.parse(JSON.stringify(currentGameMap));
        // Preload image resource data, load the initialized game map
        loadImage(imageMapping, function () {
            initGameMap();
            showGameInfo();
        });
    }
    
    // Define a function to draw the blocks on the map
    function drawBlock(x, y) {
        // Because the background of the man and the target point are transparent and the man has directions, the man and the target point have to be handled separately
        var image = false;
        var blockType = currentGameMap[y][x];
        switch (blockType) {
            case BLOCK_ENUM.background:
                image = imageMapping.floor;
                break;
            case BLOCK_ENUM.wall:
                image = imageMapping.wall;
                break;
            case BLOCK_ENUM.box: 
                image = imageMapping.box;
                break;
            case BLOCK_ENUM.box_ok:
                image = imageMapping.box_ok;
                break;
        }
        if (image) {
            // Compress an 80*80 image into a 50*50 one
            // ctx.drawImage(image, 0, 0, 80, 80, BLOCK_WIDTH * x, BLOCK_HEIGHT * y, BLOCK_WIDTH, BLOCK_HEIGHT);
            ctx.drawImage(image, 0, 0, 80, 80, BLOCK_WIDTH * x - 50, BLOCK_HEIGHT * y - 50, BLOCK_WIDTH * 1.7, BLOCK_HEIGHT * 1.7);
        } else {
            ctx.drawImage(imageMapping.floor, 0, 0, 80, 80, BLOCK_WIDTH * x - 50, BLOCK_HEIGHT * y - 50, BLOCK_WIDTH * 1.7, BLOCK_HEIGHT * 1.7);
            if (blockType === BLOCK_ENUM.point) {
                // ctx.drawImage(imageMapping.point, 0, 0, 80, 80, BLOCK_WIDTH * x, BLOCK_HEIGHT * y, BLOCK_WIDTH, BLOCK_HEIGHT);
                ctx.drawImage(imageMapping.point, 0, 0, 80, 80, BLOCK_WIDTH * x - 50, BLOCK_HEIGHT * y - 50, BLOCK_WIDTH * 1.5, BLOCK_HEIGHT * 1.5);
            } else if (blockType === BLOCK_ENUM.player) {
                drawMan(x, y)
            }
        }
    }

    // Define a function to draw the man on the map
    function drawMan(x, y) {
        manLocation.x = x;
        manLocation.y = y;
        // Position of the player image
        var sx = 0, sy = 0; 
        switch (manLocation.position) {
            case 'up':
                sy = 0;
                break;
            case 'down':
                sy = 80;
                break;
            case 'left':
                sy = 160;
                break;
            case 'right':
                sy = 240;
                break;
        }
        ctx.drawImage(imageMapping.player, sx, sy, 80, 80, BLOCK_WIDTH * x - 50, BLOCK_HEIGHT * y - 50, BLOCK_WIDTH, BLOCK_HEIGHT);
    }

    // Define a function to draw the game maps
    function initGameMap() {
        for (var i = 0; i < HEIGHT_SIZE; i++) {
                for (var j = 0; j < WIDTH_SIZE; j++) {
                    drawBlock(j, i);
            }
        }
    }

    // Monitor the player's keystroke events and move once with a single press.
    window.onkeydown = onkeydown;
    window.onkeyup = function () {
        window.onkeydown = onkeydown;
    };

    function onkeydown(event) {
        switch (event.key) {
            case 'ArrowUp':
            handleKeystroke('up');
                break;
            case 'ArrowDown':
            handleKeystroke('down');
                break;
            case 'ArrowLeft':
            handleKeystroke('left');
                break;
            case 'ArrowRight':
            handleKeystroke('right');
                break;
        }
        // With window.onkeyup together to limit key presses to trigger one event
        window.onkeydown = null;
    }
        
    var p1, p2, p3, p4;
    // Define a function to handle the user's keystroke event.
    function handleKeystroke(position) {
        manLocation.position = position;
        switch (position) {
            case 'up':
                // Get the two coordinate positions which are in front of the man to determine if the man can move
                p1 = {x: manLocation.x, y: manLocation.y - 1};
                p2 = {x: manLocation.x, y: manLocation.y - 2};
                // Get the coordinates of the block to the right of the box the man is pushing 
                p3 = {x: manLocation.x + 1, y: manLocation.y - 1};
                // Get the coordinates of the block to the left of the box the man is pushing 
                p4 = {x: manLocation.x - 1, y: manLocation.y - 1};
                break;
            case 'down':
                p1 = {x: manLocation.x, y: manLocation.y + 1};
                p2 = {x: manLocation.x, y: manLocation.y + 2};
                // Get the coordinates of the block to the right of the box the man is pushing 
                p3 = {x: manLocation.x + 1, y: manLocation.y + 1};
                // Get the coordinates of the block to the left of the box the man is pushing 
                p4 = {x: manLocation.x - 1, y: manLocation.y + 1};
                break;
            case 'left':
                p1 = {x: manLocation.x - 1, y: manLocation.y};
                p2 = {x: manLocation.x - 2, y: manLocation.y};
                // Get the coordinates of the block on the top of the box that the man is pushing
                p3 = {x: manLocation.x - 1, y: manLocation.y - 1};
                // Get the coordinates of the block under the box the man is pushing
                p4 = {x: manLocation.x - 1, y: manLocation.y + 1};
                break;
            case 'right':
                p1 = {x: manLocation.x + 1, y: manLocation.y};
                p2 = {x: manLocation.x + 2, y: manLocation.y};
                // Get the coordinates of the block on the top of the box that the man is pushing
                p3 = {x: manLocation.x + 1, y: manLocation.y - 1};
                // Get the coordinates of the block under the box the man is pushing
                p4 = {x: manLocation.x + 1, y: manLocation.y + 1};
                break;
        }
        // Update the game data and redraw the game map if the man can move
        if (handleMove(p1, p2)) {
            moveCount++;
            showGameInfo();
        }
        // Draw the map with the current updated data, and redraw it one time without moving to change the orientation of the man
        initGameMap();
        // Delay for 0.1 second to wait for the canvas to be painted
        setTimeout(function () {
        // If the moves are all completed then go to the next level
        if (checkFinish()) {
                switch (currentLevel) {
                    case 0:
                        // Determine if this level has a history record
                        if(localStorage.getItem("levelOneRecord")) {
                            // Compare the number of steps used by the player with the number of steps stored in localStorage to determine the new record
                            minimumMoveCount = localStorage.getItem("levelOneRecord") < moveCount ? localStorage.getItem("levelOneRecord") : moveCount;
                            localStorage.setItem("levelOneRecord", minimumMoveCount);
                        } else {
                            localStorage.setItem("levelOneRecord", moveCount);
                        }
                        break;
                    case 1:
                        if(localStorage.getItem("levelTwoRecord")) {
                            minimumMoveCount = localStorage.getItem("levelTwoRecord") < moveCount ? localStorage.getItem("levelTwoRecord") : moveCount;
                            localStorage.setItem("levelTwoRecord", minimumMoveCount);
                        } else {
                            localStorage.setItem("levelTwoRecord", moveCount);
                        }
                        break;
                    case 2:
                        if(localStorage.getItem("levelThreeRecord")) {
                            minimumMoveCount = localStorage.getItem("levelThreeRecord") < moveCount ? localStorage.getItem("levelThreeRecord") : moveCount;
                            localStorage.setItem("levelThreeRecord", minimumMoveCount);
                        } else {
                            localStorage.setItem("levelThreeRecord", moveCount);
                        }
                        break;
                    case 3:
                        if(localStorage.getItem("levelFourRecord")) {
                            minimumMoveCount = localStorage.getItem("levelFourRecord") < moveCount ? localStorage.getItem("levelFourRecord") : moveCount;
                            localStorage.setItem("levelFourRecord", minimumMoveCount);
                        } else {
                            localStorage.setItem("levelFourRecord", moveCount);
                        }
                        break;
                    case 4:
                        if(localStorage.getItem("levelFiveRecord")) {
                            minimumMoveCount = localStorage.getItem("levelFiveRecord") < moveCount ? localStorage.getItem("levelFiveRecord") : moveCount;
                            localStorage.setItem("levelFiveRecord", minimumMoveCount);
                        } else {
                            localStorage.setItem("levelFiveRecord", moveCount);
                        }
                        break;
                    case 5:
                        if(localStorage.getItem("levelSixRecord")) {
                            minimumMoveCount = localStorage.getItem("levelSixRecord") < moveCount ? localStorage.getItem("levelSixRecord") : moveCount;
                            localStorage.setItem("levelFSixRecord", minimumMoveCount);
                        } else {
                            localStorage.setItem("levelSixRecord", moveCount);
                        }
                        break;
                }
                alert('Congratulations! You have passed the current level!');
                // Enter the next level
                initGame(currentLevel + 1);
            }
        }, 100)
    }

    // Define a function to handle the movement of the man
    function handleMove(p1, p2) {
        // If it goes beyond the top edge of the map, it cannot be allowed to pass
        if (p1.y < 0) return false;
        // If it goes beyond the left edge of the map, it cannot be allowed to pass
        if (p1.x < 0) return false;
        // If it goes beyond the bottom edge of the map, it cannot be allowed to pass
        if (p1.y > currentGameMap.length) return false;
        // If it goes beyond the right edge of the map, it cannot be allowed to pass
        if (p1.x > currentGameMap[0].length) return false;
        // If there is a wall in front of the man, it cannot be allowed to pass
        if (currentGameMap[p1.y][p1.x] === BLOCK_ENUM.wall) return false;
        // Determine if the box being pushed in this step is facing an obstacle in both directions, which means this box can not be pushed any further
        if (currentGameMap[p1.y][p1.x] === BLOCK_ENUM.box) {
            if((currentGameMap[p2.y][p2.x] === BLOCK_ENUM.wall || currentGameMap[p2.y][p2.x] === BLOCK_ENUM.box || currentGameMap[p2.y][p2.x] === BLOCK_ENUM.box_ok) && (currentGameMap[p3.y][p3.x] === BLOCK_ENUM.box || currentGameMap[p3.y][p3.x] === BLOCK_ENUM.wall || currentGameMap[p3.y][p3.x] === BLOCK_ENUM.box_ok) && currentGameMap[p4.y][p4.x] !== BLOCK_ENUM.point)
            {
                alert('A deadblock has been found, you can press the RESTART button to restart this level.');
            }
            if((currentGameMap[p2.y][p2.x] === BLOCK_ENUM.wall || currentGameMap[p2.y][p2.x] === BLOCK_ENUM.box || currentGameMap[p2.y][p2.x] === BLOCK_ENUM.box_ok) && (currentGameMap[p4.y][p4.x] === BLOCK_ENUM.box || currentGameMap[p4.y][p4.x] === BLOCK_ENUM.wall || currentGameMap[p4.y][p4.x] === BLOCK_ENUM.box_ok) && currentGameMap[p3.y][p3.x] !== BLOCK_ENUM.point) 
            {
                alert('A deadblock has been found, you can press the RESTART button to restart this level.');
            }
        }
        // When there is a box in front of the man, determine if there is also an obstacle in front of the box(the obstacle could be a box or a wall)
        if (currentGameMap[p1.y][p1.x] === BLOCK_ENUM.box || currentGameMap[p1.y][p1.x] === BLOCK_ENUM.box_ok) {
            if (currentGameMap[p2.y][p2.x] === BLOCK_ENUM.wall
                || currentGameMap[p2.y][p2.x] === BLOCK_ENUM.box
                || currentGameMap[p2.y][p2.x] === BLOCK_ENUM.box_ok) {
                return false;
            }
            // If there is no obstacle in front of the box then it should be moved one step forward
            // Change the value of the corresponding coordinate point on the map
            if (currentGameMap[p2.y][p2.x] === BLOCK_ENUM.point) {
                currentGameMap[p2.y][p2.x] = BLOCK_ENUM.box_ok;
            } else {
                currentGameMap[p2.y][p2.x] = BLOCK_ENUM.box;
            }
        }
        // The man takes a step forward
        // Change the value of the corresponding coordinate point on the map
        currentGameMap[p1.y][p1.x] = BLOCK_ENUM.player;
        
        // Get the coordinates of the man's position before it moves
        var v = CURRENT_GAME_MAP[manLocation.y][manLocation.x];
        // Determine if the location of the man is the target point
        if (v === BLOCK_ENUM.point){ 
            v = BLOCK_ENUM.point;
        } else {
            if (v === BLOCK_ENUM.box_ok){
                v = BLOCK_ENUM.point;
            } else {
                v = BLOCK_ENUM.floor;
            }
        }
        //Reset the map parameters of the man's position
        currentGameMap[manLocation.y][manLocation.x] = v;
        return true;
    }

    // Determine if the push was successful
    function checkFinish() {
        for (var i = 0; i < currentGameMap.length; i++) {
            for (var j = 0; j < currentGameMap[i].length; j++) {
                // As long as there is no box at one of the target points, it is not a success
                if (CURRENT_GAME_MAP[i][j] === BLOCK_ENUM.point && currentGameMap[i][j] !== BLOCK_ENUM.box_ok) {
                    return false;
                }
            }
        }
        return true;
    }

    var homePage = document.getElementById('homepage'),
        gameBoxWrap = document.getElementById('game-box-wrap'),
        introOne = document.getElementById('introductionOne'),
        introTwo = document.getElementById('introductionTwo'),
        chooseLevel = document.getElementById('game-choice-box');

    var nextOne = document.getElementById('nextOne'),
        nextTwo = document.getElementById('nextTwo'),
        restart = document.getElementById('restart');

    nextOne.addEventListener('click', function() {
        introOne.style.display = 'none';
        introTwo.style.display = 'block';
    })
    nextTwo.addEventListener('click', function() {
        introTwo.style.display = 'none';
        chooseLevel.style.display = 'block';
    })
    restart.addEventListener('click', function() {
        location.reload();
    })
}







