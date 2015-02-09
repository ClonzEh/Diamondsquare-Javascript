function diamondSquare(size, array, cap) {

    //this.grid = grid;
    this.noise = 100;
    this.cap = cap + this.noise;
    this.size = size;
    this.heightMapList = new createGrid(this.size, this.size, function(x, y) {   return { x: x, y: y, height: 0 };   });

    for (var i = 0; i < array.length; i++) {

        this.heightMapList[array[i].x][array[i].y].height = array[i].height;
    }

    var l = this.size -1;
    this.squareCenter(this.heightMapList[0][0], l);
    this.diamondCenters(this.heightMapList[0][0], l);
    var quadrants = this.getQuadrants(l);
    this.recursive(quadrants, l / 2);

    this.drawAsOneImage();
    //this.draw();
}

diamondSquare.prototype.squareCenter = function (topLeft, length) {

    var halfLength = length / 2;

    var mid = this.heightMapList[topLeft.x + halfLength][topLeft.y + halfLength];
    mid.height = (topLeft.height + //TL
        this.heightMapList[topLeft.x + length][topLeft.y].height + //TR
        this.heightMapList[topLeft.x][topLeft.y + length].height + //BL
        this.heightMapList[topLeft.x + length][topLeft.y + length].height) / 4; //BR

    mid.height += this.getNoise(length); //ADD NOISE!
    return { mid: mid, size: length };
};

diamondSquare.prototype.diamondCenters = function (topLeft, length) {



    var halfLength = length / 2;
    var mid = this.heightMapList[topLeft.x + halfLength][topLeft.y + halfLength];

    var point = this.heightMapList[mid.x - halfLength][mid.y]; //LEFT SIDE
    point.height = mid.height + //R
        this.heightMapList[point.x][point.y - halfLength].height + //T
        this.heightMapList[point.x][point.y + halfLength].height; //B

    if (this.heightMapList[mid.x - length] != undefined && this.heightMapList[mid.x - length][mid.y] != undefined) {
        point.height += this.heightMapList[mid.x - length][mid.y].height; //L
        point.height /= 4;
    } else {
        point.height += mid.height;
        point.height /= 4;
    }
    point.height += this.getNoise(length); //ADD NOISE!


    point = this.heightMapList[mid.x][mid.y - halfLength]; //TOP SIDE
    point.height = mid.height + //B
        this.heightMapList[point.x - halfLength][point.y].height + //L
        this.heightMapList[point.x + halfLength][point.y].height; //R


    if (this.heightMapList[mid.x] != undefined && this.heightMapList[mid.x][mid.y - length] != undefined) {
        point.height += this.heightMapList[mid.x][mid.y - length].height; //T
        point.height /= 4;
    } else {
        point.height += mid.height;
        point.height /= 4;
    }
    point.height += this.getNoise(length); //ADD NOISE!


    point = this.heightMapList[mid.x + halfLength][mid.y]; //RIGHT SIDE
    point.height = mid.height + //L
        this.heightMapList[point.x][point.y - halfLength].height + //T
        this.heightMapList[point.x][point.y + halfLength].height; //B

    if (this.heightMapList[mid.x + length] != undefined && this.heightMapList[mid.x + length][mid.y] != undefined) {
        point.height += this.heightMapList[mid.x + length][mid.y].height; //R
        point.height /= 4;
    } else {
        point.height += mid.height;
        point.height /= 4;
    }
    point.height += this.getNoise(length); //ADD NOISE!


    point = this.heightMapList[mid.x][mid.y + halfLength]; //TOP SIDE
    point.height = mid.height + //T
        this.heightMapList[point.x - halfLength][point.y].height + //L
        this.heightMapList[point.x + halfLength][point.y].height; //R


    if (this.heightMapList[mid.x] != undefined && this.heightMapList[mid.x][mid.y + length] != undefined) {
        point.height += this.heightMapList[mid.x][mid.y + length].height; //B
        point.height /= 4;
    } else {
        point.height += mid.height;
        point.height /= 4;
    }
    point.height += this.getNoise(length); //ADD NOISE!
};

diamondSquare.prototype.getQuadrants = function(length) {

    var halfLength = length / 2;
    if (halfLength == 1) { return null;}

    var totals = ((this.size-1) / halfLength);
    var array = [];
    for (var i = 0,x = 0, y = 0; i < totals * totals; i++) {

        array.push(this.heightMapList[halfLength*x][halfLength*y]);
        x++;
        if (x == totals) { y++; x = 0; }
    }

    /*var spots = [
        this.heightMapList[mid.x - halfLength][mid.y - halfLength], //TL quadrant
        this.heightMapList[mid.x][mid.y - halfLength], //TR quadrant
        this.heightMapList[mid.x - halfLength][mid.y], //BL quadrant
        this.heightMapList[mid.x][mid.y] //BR quadrant
    ];*/

    /*array.push(
        this.heightMapList[mid.x - halfLength][mid.y - halfLength], //TL quadrant
        this.heightMapList[mid.x][mid.y - halfLength], //TR quadrant
        this.heightMapList[mid.x - halfLength][mid.y], //BL quadrant
        this.heightMapList[mid.x][mid.y] //BR quadrant
    );*/

    return array;//{spots: spots, size: halfLength, points: [] };
};

diamondSquare.prototype.recursive = function(quads, length) {

    if(quads == null) { return; }

    //Complete all Square centers...
    for (var i = quads.length; i--;) {

        this.squareCenter(quads[i], length);
    }

    //Complete all diamond centers...
    for (var i = quads.length; i--;) {

        this.diamondCenters(quads[i], length);
    }

    var l = length / 2;
    if (l < 2) { return; }

    //Find all quadrants for the next recurse
    quads = this.getQuadrants(length);

    //recursive loop
    this.recursive(quads, l);
};

diamondSquare.prototype.getNoise = function(l) {

    var n = this.noise;
    //var n = (l / (this.size - 1)) * this.noise;
    //var n = (l / (this.size - 1)) * this.noise; //(smooth out peaks // shaggedy early
    //l *=  (1 - (n * 0.2)); //smoothening??
    //l *= 2; //zoom in / cartoon smoothening
    return (Math.random() * l) - l / 2;
    //return (Math.random() * n) - n / 2;
};


//Do a test for pixel DATA = []... then go through with it!
//next demo is a belzeir curve thingy... useful for smoothing pathfinding and stuff...
diamondSquare.prototype.drawAsOneImage = function () {

    var highest = this.noise + this.cap;
    var data = [];

    /*for (var i = this.heightMapList.length * this.heightMapList[0].length, x = 0, y = 0; i--;) {

        if (this.heightMapList[x][y].height > highest) {

            highest = this.heightMapList[x][y].height;
        }
        x++;
        if (x == this.heightMapList.length) { x = 0; y++;}
    }*/

    for (var i = this.heightMapList.length * this.heightMapList[0].length, x = 0, y = 0; i--;) {

        var hm = this.heightMapList[x][y];//loadgqs
        var color = (hm.height /highest) * 255 ;
        var r = 0, g = 0, b = 0;
        if (color < 68) { b = 120; }
        if (color < 55) { b = 80; }
        if (color < 32) { b = 40; }

        if (color < 80 && color >= 68) { b = 8; r = 140; g = 140; }
        if (color >= 80) { b = 0; r = 0; g = 170; }
        if (color >= 140) { b = 0; r = 0; g = 100; }
        if (color >= 200) { b = 0; r = 0; g = 70; }
        if (color >= 220) { b = 50; r = 50; g = 50; }
        if (color >= 230) { b = 100; r = 100; g = 100; }
        if (color >= 340) { b = 255; r = 255; g = 255; }
        data.push(r, g, b, 255);
        //data.push(color,color,color,255);

        x++;
        if (x == this.heightMapList.length) { x = 0; y++;}
    }

    var s = this.size;
    //data = new Uint8ClampedArray(200,0,0,1);
    var newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('width', s);
    newCanvas.setAttribute('height', s);

    var tempctx = newCanvas.getContext('2d');


    var imageData = tempctx.createImageData(s, s);
    imageData.data.set(data);

    tempctx.putImageData(imageData, 0, 0);

    clonazia.game.gridBackground.image = newCanvas;
    var scale = stretch(clonazia.game.gridBackground, clonazia.game.width, clonazia.game.height);
    clonazia.game.gridBackground.scaleX = scale.x;
    clonazia.game.gridBackground.scaleY = scale.y;
    /*newCanvas.style.background = 'white';
    newCanvas.style.zIndex = '900';
    newCanvas.style.position = 'absolute';
    $('#gameView').append(newCanvas);*/


};

function createCanvas(width, height) {
    var c = document.createElement('canvas');
    c.setAttribute('width', width);
    c.setAttribute('height', height);
    c.style.background = 'white';
    c.style.zIndex = '900';
    c.style.position = 'absolute';
    return c;
}



diamondSquare.prototype.draw = function () {

    var highest = 0;
    for (var i = this.heightMapList.length * this.heightMapList[0].length, x = 0, y = 0; i--;) {

        if (this.heightMapList[x][y].height > highest) {

            highest = this.heightMapList[x][y].height;
        }
        x++;
        if (x == this.heightMapList.length) { x = 0; y++;}
    }

    for (var i = this.heightMapList.length * this.heightMapList[0].length, x = 0, y = 0; i--;) {

        var hm = this.heightMapList[x][y];//load
        var color = Math.round((hm.height /highest) * 255 );
        clonazia.game.grid[hm.x][hm.y].graphics._fill.style = 'rgb(' + color + ', ' + color + ', ' + color + ')';

        x++;
        if (x == this.heightMapList.length) { x = 0; y++;}
    }

    updateImageFromContainer(clonazia.game.gridContainer);
};



/*
function diamondSquare(grid, array) {

    //array structure is topleft,topright,bottomleft,bottomright
    this.grid = grid;
    this.noise = 1.5;

    this.heightMapList = [];






    for (var i = array.length; i--;) {

        this.heightMapList.push(array[i]);
    }

    this.sides = [];
    this.square = array;
    this.currentMid;



    var mid;
    var square = this.square;
    mid = this.getCenter(square);
    if (mid == null) { return; }
    this.diamond(square, mid);
    //start recursiona
    var time = Date.now();
    this.recursion(this.getQuadrants(square));

    console.log(Date.now() - time, 'total');
    this.draw();
}

diamondSquare.prototype.recursion = function(quads) {

    var time = Date.now();
    var square = quads[0];
    var mid = this.getCenter(square);
    if (mid == null) { return; }
    this.diamond(square, mid);
    this.recursion(this.getQuadrants(square));
    console.log(Date.now() - time);

    var square = quads[1];
    var mid = this.getCenter(square);
    if (mid == null) { return; }
    this.diamond(square, mid);
    this.recursion(this.getQuadrants(square));

    var square = quads[2];
    var mid = this.getCenter(square);
    if (mid == null) { return; }
    this.diamond(square, mid);
    this.recursion(this.getQuadrants(square));

    var square = quads[3];
    var mid = this.getCenter(square);
    if (mid == null) { return; }
    this.diamond(square, mid);
    this.recursion(this.getQuadrants(square));

};

diamondSquare.prototype.getCenter = function (array) {

    var x = (array[1].x + array[2].x) / 2;
    var y = (array[1].y + array[2].y) / 2;
    var avg = 0;

    if (x % 1 !== 0) { return null; } //is not an int
    for (var i = array.length; i--;) {

        avg += array[i].height;
    }

    avg /= array.length;
    avg += Math.round(Math.random() * (this.noise * 2)) - this.noise;

    var midPoint = {x: x, y: y, height: avg };
    this.heightMapList.push(midPoint);
    this.currentMid = midPoint; //not needed...
    return midPoint;
};

diamondSquare.prototype.diamond = function (array, midPoint) {

    this.sides = [];
    this.diamondMidPoint(array[0], array[1], midPoint, 'top');
    this.diamondMidPoint(array[0], array[2], midPoint, 'left');
    this.diamondMidPoint(array[1], array[3], midPoint, 'right');
    this.diamondMidPoint(array[2], array[3], midPoint, 'bottom');
};

//takes a large square and cuts it up into quadrants...
diamondSquare.prototype.getQuadrants = function(square) {

    //find each quadrant from a larger box
    var quadList = [];
    quadList.push([square[0], this.sides[0], this.sides[1], this.currentMid]);

    quadList.push([this.sides[0], square[1], this.currentMid, this.sides[2]]);

    quadList.push([this.sides[1], this.currentMid, square[2], this.sides[3]]);

    quadList.push([this.currentMid, this.sides[2], this.sides[3], square[3]]);

    return quadList;
};

//a & b are points & c is the old midpoint
diamondSquare.prototype.diamondMidPoint = function (a, b, c, unknown) {

    //find each quadrant...

    var diamond = [
        a,
        c,
        b
    ];

    var x = (a.x + b.x) / 2;
    var y = (a.y + b.y) / 2;

    var mid = { x: x, y: y };

    var side;
    switch(unknown) {

        case 'left' : side = this.findSquare({x: mid.x - 1, y: mid.y }); break;
        case 'right' : side = this.findSquare({x: mid.x + 1, y: mid.y }); break;
        case 'top' : side = this.findSquare({x: mid.x, y: mid.y - 1 }); break;
        case 'bottom' : side = this.findSquare({x: mid.x, y: mid.y + 1 }); break;
    }

    if (side != null) { diamond.push(side); }

    var avg = 0;

    for (var i = diamond.length; i--;) {

        avg += diamond[i].height;
    }

    avg /= diamond.length;
    avg += Math.random() * this.noise;
    var diamondMid = {x: x, y: y, height: avg };
    this.heightMapList.push(diamondMid);
    this.sides.push(diamondMid);
};

diamondSquare.prototype.draw = function () {

    var highest = 0;
    for (var i = this.heightMapList.length; i--;) {

        if (this.heightMapList[i].height > highest) {

            highest = this.heightMapList[i].height;
        }
    }

    for (var i = this.heightMapList.length; i--;) {

        var hm = this.heightMapList[i];//load
        var color = Math.round((hm.height /highest) * 255 );
        clonazia.game.grid[hm.x][hm.y].graphics._fill.style = 'rgb(' + color + ', ' + color + ', ' + color + ')';
    }

    updateImageFromContainer(clonazia.game.gridContainer);
};

diamondSquare.prototype.findSquare = function(position) {

    for (var i = this.heightMapList; i--;) {

        if (this.heightMapList[i].x == position.x && this.heightMapList[i].y == position.y) {

            return this.heightMapList[i];
        }
    }

    return null;
};*/
