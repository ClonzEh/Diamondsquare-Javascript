//Start game code...
function game() {

    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) { console.clear(); }
    console.log('Starting game...');

    //Quick reference for resolution
    this.width = display.resolution.x;
    this.height = display.resolution.y;
    this.fpsTimer = 0;

    //document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });

    this.frameRate = 60;

    /**
     *SETTING CANVAS PIXEL DENSITY
     */
    {

        var cct = document.getElementById("gameCanvas");
        var cct1 = document.getElementById("backgroundCanvas");
        var cct2 = document.getElementById("foregroundCanvas");

        cct.style.left = 0 + 'px';
        cct.width = this.width;
        cct.height = this.height;

        cct1.width = this.width;
        cct1.height = this.height;

        cct2.width = this.width;
        cct2.height = this.height;
    }

    this.stage = new createjs.Stage("gameCanvas");
    this.background = new createjs.Stage("backgroundCanvas");
    this.foreground = new createjs.Stage("foregroundCanvas");

    var update = function(e) { this.tick(e); };
    createjs.Ticker.setFPS(this.frameRate);
    createjs.Ticker.addEventListener("tick", update.bind(this));
    createjs.Touch.enable(this.stage);
    this.stage.enableMouseOver(60); //low number takes more time to respond (mouseover event listener).


    this.background.update();
}
game.prototype.resize = function () {

    var width = $('#gameView').width();
    var height = $('#gameView').height();

    $('#score').css('font-size', height * 0.065 + 'px');
    $('#answer_Splash').css('font-size', height * 0.03 + 'px');
    $('#total_score').css('font-size', height * 0.065 + 'px');
    $('#total_score').find('p').css('font-size', height * 0.065 + 'px');
    $('#round_count').css('font-size', height * 0.03 + 'px');
    $('#round_count').find('p').css('font-size', height * 0.028 + 'px');
    $('#tempinstru').css('font-size', height * 0.03 + 'px');
    $('button').css('font-size', height * 0.03 + 'px');
};

game.prototype.controller = function () {

    // GRIDS
    //DIAMOND SQUARE NEEDS 2^x + 1 grid size
    var gridSize = 10;
    this.ds = (1 + Math.pow(2, gridSize));

    this.gridObject = {

        rows: 5,
        columns: 5,
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        spacingX: 1,
        spacingY: 1
    };

    // CREATE INDIVIDUAL GRID SPOT (automatic but changeable)
    this.gridSpot = {

        x: this.gridObject.spacingX,
        y: this.gridObject.spacingY,
        width: ~~( (this.gridObject.width - (this.gridObject.spacingX * (this.gridObject.rows) + 1)) / this.gridObject.rows ),
        height: ~~( (this.gridObject.height - (this.gridObject.spacingY * (this.gridObject.columns) + 1)) / this.gridObject.columns )
    };

    // SCENE COLOR SCHEME
    this.mainColors = {

        open: 'rgba(0,109,150,1)',
        closed: 'rgba(40,40,40,1)',
        character: 'rgba(0,230,50,1)',
        end: 'rgba(255,50,50,1)'
    };
    // ADD LAYERS [See Draw Order for Add/Remove/Order]
    this.layers = {

        gridImage: new createjs.Container(),
        grid: new createjs.Container(),
        character:  new createjs.Container(),
        end:  new createjs.Container(),
        path: new createjs.Container()
    };

    // DISPLAY ORDER OF THE LAYERS
    this.drawOrder = [

        //this.layers.grid, //GRID is cached in gridImage!! we don't need it! Performance.
        this.layers.gridImage,
        this.layers.end,
        this.layers.character
        //this.layers.path
    ];

    // ADJUST GRID POSITION (automatic but changeable)
    $('#wrapper').css('background', 'black');
    this.gridObject.x = (this.gridObject.width - (this.gridSpot.x + this.gridObject.rows * this.gridSpot.width + this.gridObject.rows * this.gridObject.spacingX)) / 2;
    this.gridObject.y = (this.gridObject.height - (this.gridSpot.y + this.gridObject.columns * this.gridSpot.height + this.gridObject.columns * this.gridObject.spacingY)) / 2;
};

game.prototype.begin = function () {

    this.controller(); //quick control

    //Properties
    this.isPainting = false; this.mouseDown = false; this.blockType = true;
    this.pathfinder; this.moveCharacter = ""; this.moveableCharacters = [];
    this.blockColor = 'red';

    //Deal with layers & containers...
    this.dsquareImage = new createjs.Bitmap();
    this.foreground.addChild(this.layers.path);
    for (var i = 0; i < this.drawOrder.length; i++){ this.stage.addChild(this.drawOrder[i]); }
    this.gridBackground = new createjs.Bitmap(); this.gridBackground.name = 'shape';
    this.layers.gridImage.addChild(this.gridBackground);

    this.gridContainer = new createjs.Container();
    this.layers.grid.addChild(this.gridContainer);
    this.pathContainer = new createjs.Container();
    this.layers.path.addChild(this.pathContainer);
    this.layers.path.addChild(this.dsquareImage);

    //create grid
    var createGrids = function(x, y) {

        var a = this.gridSpot;
        var nextX = x * a.width + (x * this.gridObject.spacingX) + this.gridObject.x;
        var nextY = y * a.height + (y * this.gridObject.spacingY) + this.gridObject.y;

        var shapeX = ~~(a.x + nextX);
        var shapeY = ~~(a.y + nextY);

        var rectangle = new rect(shapeX, shapeY, a.width, a.height);

        var shape = createShape(rectangle, clonazia.game.mainColors.open, 'shape', clonazia.game.gridContainer);
        shape.pos = { x: x, y: y};
        shape.setBounds(0, 0, rectangle.width, rectangle.height);

        shape.character = false; shape.pathblock = false; shape.pathPenalty = 0;

        return shape;
    }.bind(this);
    this.grid = createGrid(this.gridObject.rows, this.gridObject.columns, createGrids);

    //create characters
    /*this.character = new character({x: 0, y: 0}, this.gridSpot, this.mainColors.character, 'character', this.layers.character);
    this.end = new character({x: this.gridObject.rows - 1, y: this.gridObject.columns - 1}, this.gridSpot, this.mainColors.end, 'end', this.layers.end);*/

    //create user Interface
    createUserInterface();

    //create background image of grid (performance increase)
    updateImageFromContainer(this.gridContainer, this.gridBackground);

    //run events
    //this.events();

    startDiamondSquare();
};

game.prototype.events = function () {

    this.stage.on('stagemousemove', function (e) {

        //var gridPos = { x: ~~(e.stageX / game.gridSpot.width), y: ~~(e.stageY / game.gridSpot.height) };

        for (var i = 0; i < clonazia.game.gridContainer.children.length; i++) {

            //TODO: get mouseover position with grid[~~(e.stageX / gridSpot.width)][~~(e.stageY / gridSpot.height)]


            if (pointRectangleIntersection({x: e.stageX, y: e.stageY}, clonazia.game.gridContainer.children[i])) {

                if (clonazia.game.mouseDown == true) {
                    var t = clonazia.game.gridContainer.children[i];
                    if (clonazia.game.isPainting && clonazia.game.moveCharacter == false && t.name == "shape") {

                        t.graphics._fill.style = clonazia.game.blockColor;
                        t.pathblock = clonazia.game.blockType;
                        //t.cache(0,0, t.rect.width, t.rect.height);
                        //t.updateCache();
                        //updateImageFromContainer(clonazia.game.gridContainer, clonazia.game.gridBackground);
                        updateSmall(t, clonazia.game.gridBackground);
                    }
                    if (clonazia.game.moveCharacter != "") {

                        clonazia.game.moveableCharacters[clonazia.game.moveCharacter].move(t);
                    }
                }
            }
        }

    });

    document.addEventListener('keypress', function(evt) {

        if (evt.keyCode == 13) {

            startPathFinding();
        }
    });

    this.stage.on('stagemousedown', function (e) {

        console.log(e);
        if(e.nativeEvent.button == 2) {return; }
        clonazia.game.mouseDown = true;
        var a = this.getObjectUnderPoint(e.stageX, e.stageY);
        if (a == null) { return; }
        if (a.name == 'shape') {

            var s = null;
            for (var i = 0; i < clonazia.game.gridContainer.children.length; i++) {

                if (pointRectangleIntersection({x: e.stageX, y: e.stageY}, clonazia.game.gridContainer.children[i])) {

                    s = clonazia.game.gridContainer.children[i];
                }
            }
            if (s == null) { return; }
            clonazia.game.blockColor = (s.graphics._fill.style == clonazia.game.mainColors.closed) ? clonazia.game.mainColors.open : clonazia.game.mainColors.closed;
            clonazia.game.blockType = (s.graphics._fill.style != clonazia.game.mainColors.closed);
        }
        if (s != undefined && s.name == 'shape' && s.character == false) {

            s.graphics._fill.style = clonazia.game.blockColor;
            s.pathblock =  clonazia.game.blockType;
            updateSmall(s, clonazia.game.gridBackground);
            clonazia.game.isPainting = true;
            removePath();
        }
        if (a.name == 'character' || a.name == 'end') {

            clonazia.game.moveCharacter = a.name;
            removePath();
        }

    });

    this.stage.on('stagemouseup', function (e) {

        clonazia.game.mouseDown = false;
        clonazia.game.moveCharacter = false;
        clonazia.game.isPainting = false;
        //startPathFinding();
    });
};

function pointRectangleIntersection(p, y) {
    var q = y.rect;
    var r = { x: y.x - q.width / 2, y: y.y - q.height / 2 };
    return (p.x > r.x && p.x < r.x + q.width && p.y > r.y && p.y < r.y + q.height);

}

function updateImageFromContainer(container) {

    clonazia.game.layers.gridImage.removeAllChildren();
    /*clonazia.game.gridBackground = new createjs.Bitmap();
     var testtt = [];
     for (var i = 0, c = clonazia.game.gridContainer.children, l = clonazia.game.gridContainer.children.length; i < l; i++) {

     testtt.push(c[i]);
     }
     clonazia.game.gridContainer = new createjs.Container();
     for (var i = 0; i < testtt.length; i++) {

     clonazia.game.gridContainer.addChild(testtt);
     }
     container = clonazia.game.gridContainer;*/
    var bitmap = clonazia.game.gridBackground;
//    bitmap = clonazia.game.gridBackground;
    clonazia.game.layers.gridImage.addChild(bitmap); bitmap.name='shape';
    //bitmap = new createjs.Bitmap();
    //clonazia.game.gridBackground = new createjs.Bitmap(); clonazia.game.gridBackground.name = 'shape';
    bitmap.uncache();


    //container.uncache();
    var bnds = container.getTransformedBounds();

    container.cache(0, 0, clonazia.game.gridObject.width, clonazia.game.gridObject.height);//bnds.width, bnds.height);

    var a = container.cacheCanvas;
    //a.getContext('2d').clearRect(0,0,clonazia.game.width, clonazia.game.height);


    bitmap.image = a;
    //bitmap.image = a;
    bitmap.rect = bnds;
    container.uncache();
    //container.updateCache();
}

function updateSmall(shape, bitmap) {


    shape.cache(0, 0, shape.rect.width, shape.rect.height);
    bitmap.cache(0, 0, bitmap.image.width, bitmap.image.height); //this used to be bitmap.rect.width / height

    var ctx = bitmap.image.getContext('2d');
    ctx.drawImage(shape.cacheCanvas, (shape.x - (shape.rect.width / 2)), (shape.y - shape.rect.height / 2));
    shape.uncache();
    bitmap.updateCache();
    //shape.updateCache();

}

function character(spot, rect, color, name, stage) {

    clonazia.game.moveableCharacters[name] = this;
    this.name = name;
    this.gridSpot = clonazia.game.grid[spot.x][spot.y];
    this.gridSpot.character = true;
    this.shape = new createShape(rect, color, name, stage);
    this.shape.x = this.gridSpot.x; this.shape.y = this.gridSpot.y;

}

character.prototype.move = function(spot) {

    this.gridSpot.character = false;
    this.gridSpot = spot;

    this.shape.x = this.gridSpot.x;
    this.shape.y = this.gridSpot.y;

    this.gridSpot.character = true;
};

function clearGrid(clr) {
    clr = clr || clonazia.game.mainColors.open;
    var a = clonazia.game;
    for (var i = 0, c = a.gridContainer.children; i < a.gridContainer.children.length; i++) {
        c[i].graphics._fill.style = clr;
        c[i].pathblock = false;
        /*updateSmall(c[i], a.gridBackground);*/
    }
    updateImageFromContainer(a.gridContainer, a.gridBackground);
    removePath();
}



function startPathFinding() {

    var game = clonazia.game;

    removePath();

    game.pathfinder = new pathFind(game.grid, game.character.gridSpot.pos, game.end.gridSpot.pos);


}

function removePath() {

    var game = clonazia.game;

    game.layers.path.removeChild(game.pathContainer);
    game.pathContainer = new createjs.Container();
    game.layers.path.addChild(game.pathContainer);
    game.foreground.update();
}

//Deal with Shapes
function createShape(rect, color, name, container) {

    var shape = new createjs.Shape();
    shape.name = name || 'none';
    shape.graphics.beginFill(color).drawRect(0, 0, rect.width, rect.height);
    shape.width = rect.width;
    shape.height = rect.height;
    shape.regX = rect.width / 2;
    shape.regY = rect.height / 2;
    shape.x = rect.x + shape.width / 2;
    shape.y = rect.y + shape.height / 2;
    shape.topLeft =  { x: rect.x, y: rect.y };

    shape.rect = rect;

    container.addChild(shape);

    return shape;
}

//Update loop, e for delta time
game.prototype.tick = function(e) {

    if (this.fpsTimer < e.timeStamp) {
        this.fpsTimer = e.timeStamp + 1000;
        $('#fps').html('<p>FPS: <b>' + ~~(createjs.Ticker.getMeasuredFPS() * 10) / 10 + '</b><br>Set to: ' + this.frameRate + '</p>');

    }
    this.stage.update();

};

function startDiamondSquare() {

    clearGrid();
    var game = clonazia.game;
    var vg = 100;
    var topL = {x: 0, y: 0, height: Math.random() * vg};
    var topR = {x: game.ds - 1, y: 0, height: Math.random() * vg};
    var botL = {x: 0, y: game.ds - 1, height: Math.random() * vg};
    var botR = {x: game.ds - 1, y: game.ds - 1, height: Math.random() * vg};
    var array = [topL, topR, botL, botR];

    game.pathfinder = new diamondSquare(game.ds, array, vg );
}

//Create User-Interface CSS elementss
function createUserInterface() {

    //imageview-in-game css relativeposition
    var layout = $('#gameView');
    $('body').append('<div id="debugger" style="z-index: 800; color:rgba(255,50,50,0.8);position: absolute;width: 17%; min-width: 70px; height:auto; right: 0; background-color: rgba(40, 40, 40, 0.50); font-size: 14px; visibility: visible;"></div>');
    $('#debugger').append('<div id="fps" style="text-align: center;"><p>FPS: <b>20</b></p></div>');
    $('#debugger').append('<button class="cOH" id="diamondsquare">Generate Terrain</button>');
    addClick({element: $('#diamondsquare'), func: function(e) { startDiamondSquare(); }});

    $('#debugger').append('<button class="cOH" id="clearall">Clear All</button>');
    addClick({element: $('#clearall'), func: function(e) { clearGrid(); }});

    /* layout.append('<div id="gameviewplace" style="position:absolute; z-index:-500; width:' + imgsize.width * 100 + '%; height:' + imgsize.height * 100 + '%;left: ' + imgsize.x * 100 + '%; top: ' + imgsize.y * 100 + '%;"/>');
     layout.append('<div id="leaderboard" style="z-index: 800; color:white;position: absolute;width: 100%; height: 100%; background-color: black; font-size: 17px; visibility: hidden;"></div>');
     layout.append('<input id="nameinput" placeholder="Enter Name(Highscore)" maxlength="16" type="text" style="position: absolute;z-index:900; visibility: hidden; left: 50%; top: 50%;">');
     */
    clonazia.game.resize();
}


