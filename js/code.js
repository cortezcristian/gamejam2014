/**
 _ _   _           _____     _      _        _    _     _      
(_) \ | | _____  _|_   _| __(_) ___| | __   / \  | |__ | | ___ 
| |  \| |/ _ \ \/ / | || '__| |/ __| |/ /  / _ \ | '_ \| |/ _ \
| | |\  |  __/>  <  | || |  | | (__|   <  / ___ \| |_) | |  __/
|_|_| \_|\___/_/\_\ |_||_|  |_|\___|_|\_\/_/   \_\_.__/|_|\___|
                                                               
    Inspired on:

        Facemaze2d: HTML5 game using Box2dJS and headtrackr
        Cristian Cortez (cortez.cristian@gmail.com)

        Mouse joint demo of box2d in javascript
        Silver Moon (m00n.silv3r@gmail.com)
*/

var inxtr = {};
    inxtr.games = {};
    inxtr.lifes = 3;
    inxtr.points = 0;
    inxtr.alive = true;

var props = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
    prop,
    el = document.createElement('div');
for(var i = 0, l = props.length; i < l; i++) {
    if(typeof el.style[props[i]] !== "undefined") {
        prop = props[i];
        break;
    }
}


inxtr.rotateCube = function(xAngle,yAngle,zAngle){
    document.getElementById('cube').style[prop] = "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg) rotateZ("+zAngle+"deg)";
}
//win rotate
//inxtr.rotateCube(-90,0,0)
//lose rotate
//inxtr.rotateCube(90,-180,0)
//5 face
//inxtr.rotateCube(-90,-270,90)
//3 face
//  (-90,-90,-90) move Y

var b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2AABB = Box2D.Collision.b2AABB
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
    , b2World = Box2D.Dynamics.b2World
    , b2MassData = Box2D.Collision.Shapes.b2MassData
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    , b2Shape = Box2D.Collision.Shapes.b2Shape
    , b2Joint = Box2D.Dynamics.Joints.b2Joint
    , b2Settings = Box2D.Common.b2Settings
    ;

inxtr.games.facemaze = {};
inxtr.games.arkanoid = {};

inxtr.games.facemaze.world;
inxtr.games.facemaze.ctx;
inxtr.games.facemaze.canvas_width;
inxtr.games.facemaze.canvas_height;
inxtr.games.facemaze.canvasid="canvas";
inxtr.games.facemaze.mouse_pressed = false;
inxtr.games.facemaze.mouse_joint = false;
inxtr.games.facemaze.mouse_x, inxtr.games.facemaze.mouse_y;
inxtr.games.facemaze.superball;
inxtr.games.facemaze.gravity;
inxtr.games.facemaze.maze;
inxtr.games.facemaze.maze_base;
 
//box2d to canvas scale , therefor 1 metre of box2d = 30px of canvas :)
inxtr.games.facemaze.scale = 30;
 
/*
    Draw a world
    this method is called in a loop to redraw the world
*/  
function draw_world(world, ctx, canvas_height, canvas_width) 
{
    //convert the canvas coordinate directions to cartesian coordinate direction by translating and scaling
    ctx.save();
    ctx.translate(0 , canvas_height);
    ctx.scale(1 , -1);
    world.DrawDebugData();
    ctx.restore();
     
    ctx.font = 'bold 18px arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    //ctx.fillText('FaceMaze2d', canvas_width/2, 20);
    ctx.font = 'bold 14px arial';
    //ctx.fillText('Move your face :) by @cortezcristian', canvas_width/2, 40);
    ctx.fillText('Start', 50, 90);
    ctx.fillText('Finish', canvas_width-100, 320);
}
 
//Create box2d world object
function createWorld(world, gravity, canvasid, scale) {
    //Gravity vector x, y - 10 m/s2 - thats earth!!
    var gravity = gravity || new b2Vec2(0, -10);
    var canvasid =  canvasid || "canvas";
     
    world = new b2World(gravity , true );
     
    //setup debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById(canvasid).getContext("2d"));
    debugDraw.SetDrawScale(scale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
     
    world.SetDebugDraw(debugDraw);
     
    //create some objects
    // basic walls
    ground = createBox(world, 10.5, 2, 20 , 0.5, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    ground = createBox(world, 10.5, 14, 20, 0.5, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    ground = createBox(world, 0.7, 8, 0.5, 12.5, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    ground = createBox(world, 20.3, 8, 0.5, 12.5, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)', 'border_color' : '#7FE57F' }});

    inxtr.games.facemaze.maze_base = new Maze(6, 4, Maze.Algorithms.Prim);
    inxtr.games.facemaze.maze_base.generate();
    //console.table(maze_base.grid.data);
    /*
    */
    inxtr.games.facemaze.maze_base.grid.data = inxtr.games.facemaze.maze_base.grid.data.map(function(col, i) { 
      return inxtr.games.facemaze.maze_base.grid.data.map(function(row) { 
        return row[i] 
      })
    });
    //console.table(maze_base.grid.data);
    inxtr.games.facemaze.maze = [];
    var space=3, h_width=3, v_width=0.5, h_height=0.5, v_height=3, h_x=2, h_y=12.7, v_x=3.5, v_y=12.5;

    var f=0;
    for(var i=0; i<inxtr.games.facemaze.maze_base.grid.data.length;i++){
        for(var j=0;j<inxtr.games.facemaze.maze_base.grid.data[i].length;j++){
            console.log("Cell("+i+","+j+") E", inxtr.games.facemaze.maze_base.isEast(i,j))
            //console.log("Cell("+i+","+j+") W", inxtr.games.facemaze.maze_base.isWest(i,j))
            //console.log("Cell("+i+","+j+") N", inxtr.games.facemaze.maze_base.isNorth(i,j))
            console.log("Cell("+i+","+j+") S", inxtr.games.facemaze.maze_base.isSouth(i,j))
            f=i*2;
            console.log(f,i);
            if(typeof inxtr.games.facemaze.maze[f]=="undefined"){
                inxtr.games.facemaze.maze[f]= [];
            }
            if(typeof inxtr.games.facemaze.maze[f+1]=="undefined"){
                inxtr.games.facemaze.maze[f+1]= [];
            }
            inxtr.games.facemaze.maze[f].push((inxtr.games.facemaze.maze_base.isEast(i,j))?0:1);
            inxtr.games.facemaze.maze[f+1].push((inxtr.games.facemaze.maze_base.isSouth(i,j))?0:1);
        }
    }

    for(var i=0;i<inxtr.games.facemaze.maze.length-1;i++){
        if(i%2==0){
            //vertical walls
            wval = v_width;
            hval = v_height;
            xval = v_x;
            yval = v_y;
            spacex=space;
            spacey=-1.5;
        }else{
            //horizontal walls
            wval = h_width;
            hval = h_height;
            xval = h_x;
            yval = h_y;
            spacex=space;
            spacey=-1.5;
        }
        for(var j=0; j<inxtr.games.facemaze.maze[i].length;j++){
            if(inxtr.games.facemaze.maze[i][j]==1){
            if(i%2==0){xval=v_x+(spacex*j);yval=v_y+(spacey*i) }else{xval=h_x+(spacex*j);yval=h_y+(spacey*i)};
            ground = createBox(world, xval, yval, wval, hval, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
            }
        }
    }

    ground = createBox(world, 18, 5, 5, 0.5, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    ground = createBox(world, 15.2, 7.8, 0.5, 6, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    ground = createBox(world, 18, 5.3, 5, 0.2, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(255,0,0,1)' , 'border_color' : '#ff0000' }});

    createBox(world, 6.50, 3.80, 1 , 1, {'user_data' : {'border_color' : '#555' }});
    createBox(world, 8.50, 3.80, 1 , 1, {'user_data' : {'fill_color' : 'rgba(204,0,165,0.3)' , 'border_color' : '#555' }});
    createBox(world, 8.50, 3.80, 1 , 1, {'user_data' : {'fill_color' : 'rgba(0,0,165,0.3)' , 'border_color' : '#b4d455', 'solution':'solved' }});
    inxtr.games.facemaze.superball = createBall(world, 2, 13, 1 , {'user_data' : {'fill_color' : 'rgba(204,100,0,0.3)' , 'border_color' : '#555' }});

    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.BeginContact = function(contact) {
        var color = contact.GetFixtureA().GetBody().GetUserData()['border_color'];
        //console.log(color);
        if(color=="#ff0000"){
            //$(".winner").show();
            inxtr.rotateCube(0,0,0);
            startGame();
        }
        //console.log(contact.GetFixtureA().GetBody().GetUserData()['border_color']);
        //console.log("> ", contact.GetFixtureA().GetBody());
    }
    listener.EndContact = function(contact) {
        var color = contact.GetFixtureA().GetBody().GetUserData()['border_color'];
        //console.log(contact.GetFixtureA().GetBody().GetUserData());
        //console.log("> ", contact.GetFixtureA().GetBody());
        if(color=="#ff0000"){
            //$(".winner").hide();
        }
    }
    world.SetContactListener(listener);
     
    return world;
}       
 
//Function to create a round ball, sphere like object
function createBall(world, x, y, radius, options) 
{
    var body_def = new b2BodyDef();
    var fix_def = new b2FixtureDef();
     
    fix_def.density = options.density || 1.0;
    fix_def.friction = 0.5;
    fix_def.restitution = 0.5;
     
    var shape = new b2CircleShape(radius);
    fix_def.shape = shape;
     
    body_def.position.Set(x , y);
     
    body_def.linearDamping = 0.0;
    body_def.angularDamping = 0.0;
     
    body_def.type = b2Body.b2_dynamicBody;
    body_def.userData = options.user_data;
     
    var b = world.CreateBody( body_def );
    b.CreateFixture(fix_def);
     
    return b;
}
 
//Create standard boxes of given height , width at x,y
function createBox(world, x, y, width, height, options) 
{
     //default setting
    options = $.extend(true, {
        'density' : 1.0 ,
        'friction' : 1.0 ,
        'restitution' : 0.5 ,
         
        'type' : b2Body.b2_dynamicBody
    }, options);
       
    var body_def = new b2BodyDef();
    var fix_def = new b2FixtureDef();
     
    fix_def.density = options.density;
    fix_def.friction = options.friction;
    fix_def.restitution = options.restitution;
     
    fix_def.shape = new b2PolygonShape();
         
    fix_def.shape.SetAsBox( width/2 , height/2 );
     
    body_def.position.Set(x , y);
     
    body_def.type = options.type;
    body_def.userData = options.user_data;
     
    var b = world.CreateBody( body_def );
    var f = b.CreateFixture(fix_def);
     
    return b;
}
 
/*
    This method will draw the world again and again
    called by settimeout , self looped
*/
function step() 
{
    var fps = 60;
    var timeStep = 1.0/(fps * 0.8);
     
    //move the box2d world ahead
    inxtr.games.facemaze.world.Step(timeStep , 8 , 3);
    inxtr.games.facemaze.world.ClearForces();
     
    //redraw the world
    draw_world(inxtr.games.facemaze.world , inxtr.games.facemaze.ctx, inxtr.games.facemaze.canvas_height, inxtr.games.facemaze.canvas_width);
     
    //call this function again after 1/60 seconds or 16.7ms
    setTimeout(step , 1000 / fps);
}
 
//Convert coordinates in canvas to box2d world
function get_real(p)
{
    return new b2Vec2(p.x + 0, canvas_height_m - p.y);
}
 
function GetBodyAtMouse(includeStatic)
{
    var mouse_p = new b2Vec2(inxtr.games.facemaze.mouse_x, inxtr.games.facemaze.mouse_y);
     
    var aabb = new b2AABB();
    aabb.lowerBound.Set(inxtr.games.facemaze.mouse_x - 0.001, inxtr.games.facemaze.mouse_y - 0.001);
    aabb.upperBound.Set(inxtr.games.facemaze.mouse_x + 0.001, inxtr.games.facemaze.mouse_y + 0.001);
     
    var body = null;
     
    // Query the world for overlapping shapes.
    function GetBodyCallback(fixture)
    {
        var shape = fixture.GetShape();
         
        if (fixture.GetBody().GetType() != b2Body.b2_staticBody || includeStatic)
        {
            var inside = shape.TestPoint(fixture.GetBody().GetTransform(), mouse_p);
             
            if (inside)
            {
                body = fixture.GetBody();
                return false;
            }
        }
         
        return true;
    }
     
    inxtr.games.facemaze.world.QueryAABB(GetBodyCallback, aabb);
    return body;
}

//
// Arkanoid
//
inxtr.games.arkanoid.loser = ["Resolve the maze", "So close :)", "Ohhhhh!!!"]
inxtr.games.arkanoid.x = 138;
inxtr.games.arkanoid.y = 150;
inxtr.games.arkanoid.dx = 2;
inxtr.games.arkanoid.dy = 4;
inxtr.games.arkanoid.WIDTH;
inxtr.games.arkanoid.HEIGHT;
inxtr.games.arkanoid.ctx;
inxtr.games.arkanoid.paddlex;
inxtr.games.arkanoid.paddleh;
inxtr.games.arkanoid.paddlew;
inxtr.games.arkanoid.intervalId;
inxtr.games.arkanoid.rightDown = false;
inxtr.games.arkanoid.leftDown = false;
inxtr.games.arkanoid.gameRun = false;
inxtr.games.arkanoid.faceRun = false;
inxtr.games.arkanoid.ballFixed = true;
inxtr.games.arkanoid.bricksStarted = false;
//BRICKS
inxtr.games.arkanoid.bricks  = [],
    inxtr.games.arkanoid.NROWS   = 5,
    inxtr.games.arkanoid.NCOLS   = 5,
    inxtr.games.arkanoid.PADDING = 1,
    inxtr.games.arkanoid.BRICKH  = 15,
    inxtr.games.arkanoid.BRICKW;
inxtr.games.arkanoid.bricksColors = ["#ff1c0a","#fffd0a","#00a308","#0008db","#eb0093"]

function init_bricks(){
    inxtr.games.arkanoid.BRICKW = (inxtr.games.arkanoid.WIDTH/inxtr.games.arkanoid.NCOLS)-1;
    
    for(var i=0;i<inxtr.games.arkanoid.NROWS;i++){
        inxtr.games.arkanoid.bricks[i] = [];
        for(var j=0;j<inxtr.games.arkanoid.NCOLS;j++){
            inxtr.games.arkanoid.bricks[i][j] = 1;    
        }
    }    
}

function init_paddle(){
    inxtr.games.arkanoid.paddlex = inxtr.games.arkanoid.WIDTH/2;
    inxtr.games.arkanoid.paddleh = 10;
    inxtr.games.arkanoid.paddlew = 125;
}

function init() {
  inxtr.games.arkanoid.ctx = document.getElementById("canvas-ark").getContext("2d");
  inxtr.games.arkanoid.WIDTH = 300;
  inxtr.games.arkanoid.HEIGHT = 300;
  return setInterval(draw, 10);
}

function circle(x,y,r) {
  inxtr.games.arkanoid.ctx.fillStyle = "#888";  
  inxtr.games.arkanoid.ctx.beginPath();
  inxtr.games.arkanoid.ctx.arc(x, y, r, 0, Math.PI*2, true);
  inxtr.games.arkanoid.ctx.closePath();
  inxtr.games.arkanoid.ctx.fill();
}

function rect(x,y,w,h) {
  inxtr.games.arkanoid.ctx.beginPath();
  inxtr.games.arkanoid.ctx.rect(x,y,w,h);
  inxtr.games.arkanoid.ctx.closePath();
  inxtr.games.arkanoid.ctx.fill();
}

function clear() {
  inxtr.games.arkanoid.ctx.clearRect(0, 0, inxtr.games.arkanoid.WIDTH, inxtr.games.arkanoid.HEIGHT);
}

function checkWinner() {
    var findOne = false;

    for(var i=0;i<inxtr.games.arkanoid.bricks.length;i++){
       for(var j=0;j<inxtr.games.arkanoid.bricks[i].length;j++){
         if(inxtr.games.arkanoid.bricks[i][j]==1){
        findOne = true;
        break;
         }
       }
    }

    if(!findOne){
        setTimeout(function(){
            clearInterval(inxtr.games.arkanoid.intervalId);
            msgDraw("You Win!");
            inxtr.games.arkanoid.gameRun = false;
            //$('#play-again').show();
            inxtr.rotateCube(-90,0,0)
        }, 50);
    }
    /**Borrar mas tarde
    for(var i=0;i<bricks.length-1;i++){
       for(var j=0;j<bricks[i].length;j++){
         bricks[i][j]=0
       }
    }
    /**Borrar mas tarde**/
}

function msgDraw(m) {
  //clear();
  inxtr.games.arkanoid.ctx.fillStyle = "#fff";
  inxtr.games.arkanoid.ctx.font="30px 'VT323', cursive";
  inxtr.games.arkanoid.ctx.textAlign = 'center';
  inxtr.games.arkanoid.ctx.fillText(m,inxtr.games.arkanoid.WIDTH/2,inxtr.games.arkanoid.HEIGHT/2);
}
//END LIBRARY CODE

function draw() {
  clear();
  circle(inxtr.games.arkanoid.x, inxtr.games.arkanoid.y, 10);
  
  if(inxtr.games.arkanoid.rightDown && inxtr.games.arkanoid.paddlex < inxtr.games.arkanoid.WIDTH-inxtr.games.arkanoid.paddlew){
    inxtr.games.arkanoid.paddlex += 5;
  }
  if(inxtr.games.arkanoid.leftDown && inxtr.games.arkanoid.paddlex > 1){
    inxtr.games.arkanoid.paddlex -= 5; 
  }
  rect(inxtr.games.arkanoid.paddlex,inxtr.games.arkanoid.HEIGHT-inxtr.games.arkanoid.paddleh,inxtr.games.arkanoid.paddlew,inxtr.games.arkanoid.paddleh);

  //draw bricks
  for(var i=0;i<inxtr.games.arkanoid.NROWS;i++){
    inxtr.games.arkanoid.ctx.fillStyle = inxtr.games.arkanoid.bricksColors[i];  
    for(var j=0;j<inxtr.games.arkanoid.NCOLS;j++){
        if(inxtr.games.arkanoid.bricks[i][j]==1){
            //dibujalo
            rect(j*(inxtr.games.arkanoid.BRICKW+inxtr.games.arkanoid.PADDING)+inxtr.games.arkanoid.PADDING,i*(inxtr.games.arkanoid.BRICKH+inxtr.games.arkanoid.PADDING)+inxtr.games.arkanoid.PADDING,inxtr.games.arkanoid.BRICKW,inxtr.games.arkanoid.BRICKH);    
        }
    }
  }

  //bricks collisions
  rowheight = inxtr.games.arkanoid.BRICKH + inxtr.games.arkanoid.PADDING;
  rowwidth = inxtr.games.arkanoid.BRICKW + inxtr.games.arkanoid.PADDING;
  row = Math.floor(inxtr.games.arkanoid.y/rowheight);
  col = Math.floor(inxtr.games.arkanoid.x/rowwidth);
 
  if(inxtr.games.arkanoid.y<inxtr.games.arkanoid.NROWS*rowheight && row >=0 && col >=0 && inxtr.games.arkanoid.bricks[row][col]==1){
     inxtr.games.arkanoid.dy = -inxtr.games.arkanoid.dy;
     inxtr.games.arkanoid.bricks[row][col]=0; 
     //give points
     inxtr.points += Math.abs(row-5)*5;
     $('.user-points').text(inxtr.points);
     checkWinner();
     //bricks[2][0]=1; 
  } 

  if (inxtr.games.arkanoid.x + inxtr.games.arkanoid.dx > inxtr.games.arkanoid.WIDTH || inxtr.games.arkanoid.x + inxtr.games.arkanoid.dx < 0){
    inxtr.games.arkanoid.dx = -inxtr.games.arkanoid.dx;
  }

  if (inxtr.games.arkanoid.y + inxtr.games.arkanoid.dy < 0){
    inxtr.games.arkanoid.dy = -inxtr.games.arkanoid.dy;
  }else if(inxtr.games.arkanoid.y + inxtr.games.arkanoid.dy > inxtr.games.arkanoid.HEIGHT){
    if(inxtr.games.arkanoid.x>inxtr.games.arkanoid.paddlex&&inxtr.games.arkanoid.x<inxtr.games.arkanoid.paddlex+inxtr.games.arkanoid.paddlew){
        inxtr.games.arkanoid.dy = -inxtr.games.arkanoid.dy;
        var c = inxtr.games.arkanoid.paddlex+inxtr.games.arkanoid.paddlew/2;
        var m = Math.abs(inxtr.games.arkanoid.x-c)/inxtr.games.arkanoid.paddlew/2;
        inxtr.games.arkanoid.dx = inxtr.games.arkanoid.dx+0.5*m;
    }else{
        //dy = -dy;
        clearInterval(inxtr.games.arkanoid.intervalId);
        msgDraw(inxtr.games.arkanoid.loser[parseInt(Math.random()*inxtr.games.arkanoid.loser.length)]);
        inxtr.games.arkanoid.gameRun = false;
        $('#play-again').show();
        inxtr.lifes--;
        var l = Math.abs(inxtr.lifes-3);
        $('.life li').each(function(i,v){
            if(i<l){
                $(v).addClass('lost');    
            }   
        });
        if(inxtr.lifes){
            setTimeout(function(){
                //rotate 4 / 2nd
                inxtr.rotateCube(0,-180,0);
            },2000);
        }else{
            setTimeout(function(){
                //You lose
                inxtr.alive = false;
                inxtr.rotateCube(90,-180,0)
            },2000);
        }
    }    
  }
 
  inxtr.games.arkanoid.x += inxtr.games.arkanoid.dx;
  inxtr.games.arkanoid.y += inxtr.games.arkanoid.dy;
}

function startGame(){
    if(!inxtr.games.arkanoid.gameRun){
        inxtr.games.arkanoid.x = 138;
        inxtr.games.arkanoid.y = 150;
        inxtr.games.arkanoid.dx = 0;
        inxtr.games.arkanoid.dy = 0;
        inxtr.games.arkanoid.ballFixed = true;
        inxtr.games.arkanoid.intervalId = init();
        if(!inxtr.games.arkanoid.bricksStarted){
            init_bricks();
            inxtr.games.arkanoid.bricksStarted = true;    
        }
        init_paddle();
        inxtr.games.arkanoid.gameRun = true;
        $('#play-again').hide()
        var count = 5;
        msgDraw("Get Ready!");
        var counter = setInterval(function(){
             if(count==0){
                inxtr.games.arkanoid.dx = 2;
                inxtr.games.arkanoid.dy = 4;
                inxtr.games.arkanoid.ballFixed = false;
                clearInterval(counter);
             }   
             count--;
        },1000);
    }
}

$(document).ready(function(){
    $(document).keydown(function(e){
        if(e.keyCode==39){
            inxtr.games.arkanoid.rightDown = true;
        }

        if(e.keyCode==37){
            inxtr.games.arkanoid.leftDown = true;
        }
    });

    $(document).keyup(function(e){
        if(e.keyCode==39){
            inxtr.games.arkanoid.rightDown = false;
        }

        if(e.keyCode==37){
            inxtr.games.arkanoid.leftDown = false;
        }
    });

    $('#play-again a').click(function(e){
        startGame();            
    });

    document.addEventListener('headtrackingEvent',  function(e){
       //console.log(e) 
       if(!inxtr.games.arkanoid.gameRun && !inxtr.games.arkanoid.faceRun){
        inxtr.games.arkanoid.faceRun = true;
        //Arrancar
        startGame();
       }
       var xhead = parseInt(e.x*10);        
       $('.paddle-move').text(xhead);
       $('.paddle').text(inxtr.games.arkanoid.paddlex);
       if(inxtr.games.arkanoid.paddlex > 1 && inxtr.games.arkanoid.paddlex < inxtr.games.arkanoid.WIDTH-inxtr.games.arkanoid.paddlew){
         diff = inxtr.games.arkanoid.WIDTH/2+xhead; 
         inxtr.games.arkanoid.paddlex = (diff<=1)?2:((diff>=inxtr.games.arkanoid.WIDTH-inxtr.games.arkanoid.paddlew)?inxtr.games.arkanoid.WIDTH-inxtr.games.arkanoid.paddlew-1:diff); 
         if(inxtr.games.arkanoid.ballFixed){
             inxtr.games.arkanoid.x = inxtr.games.arkanoid.paddlex+inxtr.games.arkanoid.paddlew/2;
             inxtr.games.arkanoid.y = 280;
         }
       }
    });

    //Start Facemaze

    //first create the world
    inxtr.games.facemaze.world = createWorld(inxtr.games.facemaze.world, inxtr.games.facemaze.gravity, inxtr.games.facemaze.canvasid, inxtr.games.facemaze.scale);
     
    var canvas = $('#'+inxtr.games.facemaze.canvasid);
    inxtr.games.facemaze.ctx = canvas.get(0).getContext('2d');
     
    //get internal dimensions of the canvas
    inxtr.games.facemaze.canvas_width = parseInt(canvas.attr('width'));
    inxtr.games.facemaze.canvas_height = parseInt(canvas.attr('height'));
    canvas_height_m = inxtr.games.facemaze.canvas_height / inxtr.games.facemaze.scale;

    //start stepping
    step();

    var videoInput = document.getElementById('inputVideo');
    var canvasInput = document.getElementById('inputCanvas');
    var htracker = new headtrackr.Tracker();
    htracker.init(videoInput, canvasInput);
    htracker.start();

    document.addEventListener('headtrackingEvent',  function(e){
        //var p = get_real(new b2Vec2(e.x/scale, e.y/scale))
        //var p = get_real(new b2Vec2(e.x/20*4, (e.y-10)*-1))
        //var p = get_real(new b2Vec2(e.x, e.y/10*-1))
        var xhead = e.x/11*inxtr.games.facemaze.scale+inxtr.games.facemaze.scale/2;        
        var yhead = e.y*-1+inxtr.games.facemaze.scale/2+5;        
        $('.x-head').html(xhead);
        $('.y-head').html(yhead);
        var p = get_real(new b2Vec2(xhead, yhead));
         
        inxtr.games.facemaze.mouse_x = p.x;
        inxtr.games.facemaze.mouse_y = p.y;
         
        if(!inxtr.games.facemaze.mouse_joint)
        {
            var body = inxtr.games.facemaze.superball;
             
            if(body)
            {
                //if joint exists then create
                var def = new b2MouseJointDef();
                 
                def.bodyA = ground;
                def.bodyB = body;
                
                firstTar = inxtr.games.facemaze.superball.GetPosition();
                //fp = get_real(new b2Vec2(firstTar.x, firstTar.y));
                fp = new b2Vec2(firstTar.x, firstTar.y);
                //fp = p;
                def.target = fp;
                 
                def.collideConnected = true;
                def.maxForce = 1000 * body.GetMass();
                def.dampingRatio = 0;
                 
                inxtr.games.facemaze.mouse_joint = inxtr.games.facemaze.world.CreateJoint(def);
                 
                body.SetAwake(true);
            }
        }
        else
        {
            //nothing
        }
         
        if(inxtr.games.facemaze.mouse_joint)
        {
            inxtr.games.facemaze.mouse_joint.SetTarget(p);
        }
    });

    document.addEventListener('keydown', function(e){
        if(e.keyCode==16){
            inxtr.games.facemaze.mouse_pressed = true;
        }
    });

    document.addEventListener('keyup', function(e){
        if(e.keyCode==16){
            inxtr.games.facemaze.mouse_pressed = false;
             
            if(inxtr.games.facemaze.mouse_joint)
            {
                inxtr.games.facemaze.world.DestroyJoint(inxtr.games.facemaze.mouse_joint);
                inxtr.games.facemaze.mouse_joint = false;
            }
        }
    });
});

