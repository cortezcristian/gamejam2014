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
 
var world;
var ctx;
var canvas_width;
var canvas_height;
var mouse_pressed = false;
var mouse_joint = false;
var mouse_x, mouse_y;
var superball;
var maze;
var maze_base;
 
//box2d to canvas scale , therefor 1 metre of box2d = 30px of canvas :)
var scale = 30;
 
/*
    Draw a world
    this method is called in a loop to redraw the world
*/  
function draw_world(world, context) 
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
function createWorld() 
{
    //Gravity vector x, y - 10 m/s2 - thats earth!!
    var gravity = new b2Vec2(0, -10);
     
    world = new b2World(gravity , true );
     
    //setup debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
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

    maze_base = new Maze(6, 4, Maze.Algorithms.Prim);
    maze_base.generate();
    //console.table(maze_base.grid.data);
    /*
    */
    maze_base.grid.data = maze_base.grid.data.map(function(col, i) { 
      return maze_base.grid.data.map(function(row) { 
        return row[i] 
      })
    });
    //console.table(maze_base.grid.data);
    maze = [];
    var space=3, h_width=3, v_width=0.5, h_height=0.5, v_height=3, h_x=2, h_y=12.7, v_x=3.5, v_y=12.5;

    var f=0;
    for(var i=0; i<maze_base.grid.data.length;i++){
        for(var j=0;j<maze_base.grid.data[i].length;j++){
            console.log("Cell("+i+","+j+") E", maze_base.isEast(i,j))
            //console.log("Cell("+i+","+j+") W", maze_base.isWest(i,j))
            //console.log("Cell("+i+","+j+") N", maze_base.isNorth(i,j))
            console.log("Cell("+i+","+j+") S", maze_base.isSouth(i,j))
            f=i*2;
            console.log(f,i);
            if(typeof maze[f]=="undefined"){
                maze[f]= [];
            }
            if(typeof maze[f+1]=="undefined"){
                maze[f+1]= [];
            }
            maze[f].push((maze_base.isEast(i,j))?0:1);
            maze[f+1].push((maze_base.isSouth(i,j))?0:1);
        }
    }

    /*
    maze[0] = [0,1,0,1,0,1];
    maze[1] = [1,1,1,1,1,1];
    maze[2] = [0,1,0,1,0,1];
    maze[3] = [1,1,1,1,1,1];
    maze[4] = [0,1,0,1,0,1];
    maze[5] = [1,1,1,1,1,1];
    maze[6] = [0,1,0,1,0,1];


    maze[0] = [1,1,1,1,1,1];
    maze[1] = [0,0,1,1,1,1];
    maze[2] = [0,1,0,1,0,1];
    maze[3] = [1,1,1,1,1,1];
    maze[4] = [0,1,0,1,0,1];
    maze[5] = [0,1,1,1,1,1];
    maze[6] = [0,1,0,1,0,1];
    */


    for(var i=0;i<maze.length-1;i++){
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
        for(var j=0; j<maze[i].length;j++){
            if(maze[i][j]==1){
            if(i%2==0){xval=v_x+(spacex*j);yval=v_y+(spacey*i) }else{xval=h_x+(spacex*j);yval=h_y+(spacey*i)};
            ground = createBox(world, xval, yval, wval, hval, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
            }
        }
    }

    // inner walls
    //ground = createBox(world, 2, 11, 3, 0.5, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    //ground = createBox(world, 6, 9.7, 0.5, 9, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    /*
    ground = createBox(world, 4.7, 5, 3, 0.5, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    */
    ground = createBox(world, 18, 5, 5, 0.5, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    ground = createBox(world, 15.2, 7.8, 0.5, 6, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(204,237,165,1)' , 'border_color' : '#7FE57F' }});
    ground = createBox(world, 18, 5.3, 5, 0.2, {type : b2Body.b2_staticBody, 'user_data' : {'fill_color' : 'rgba(255,0,0,1)' , 'border_color' : '#ff0000' }});

    createBox(world, 6.50, 3.80, 1 , 1, {'user_data' : {'border_color' : '#555' }});
    createBox(world, 8.50, 3.80, 1 , 1, {'user_data' : {'fill_color' : 'rgba(204,0,165,0.3)' , 'border_color' : '#555' }});
    createBox(world, 8.50, 3.80, 1 , 1, {'user_data' : {'fill_color' : 'rgba(0,0,165,0.3)' , 'border_color' : '#b4d455', 'solution':'solved' }});
    superball = createBall(world, 2, 13, 1 , {'user_data' : {'fill_color' : 'rgba(204,100,0,0.3)' , 'border_color' : '#555' }});

    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.BeginContact = function(contact) {
        var color = contact.GetFixtureA().GetBody().GetUserData()['border_color'];
        //console.log(color);
        if(color=="#ff0000"){
            $(".winner").show();
        }
        //console.log(contact.GetFixtureA().GetBody().GetUserData()['border_color']);
        //console.log("> ", contact.GetFixtureA().GetBody());
    }
    listener.EndContact = function(contact) {
        var color = contact.GetFixtureA().GetBody().GetUserData()['border_color'];
        //console.log(contact.GetFixtureA().GetBody().GetUserData());
        //console.log("> ", contact.GetFixtureA().GetBody());
        if(color=="#ff0000"){
            $(".winner").hide();
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
    world.Step(timeStep , 8 , 3);
    world.ClearForces();
     
    //redraw the world
    draw_world(world , ctx);
     
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
    var mouse_p = new b2Vec2(mouse_x, mouse_y);
     
    var aabb = new b2AABB();
    aabb.lowerBound.Set(mouse_x - 0.001, mouse_y - 0.001);
    aabb.upperBound.Set(mouse_x + 0.001, mouse_y + 0.001);
     
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
     
    world.QueryAABB(GetBodyCallback, aabb);
    return body;
}
 
// main entry point
$(function() 
{
    //first create the world
    world = createWorld();
     
    var canvas = $('#canvas');
    ctx = canvas.get(0).getContext('2d');
     
    //get internal dimensions of the canvas
    canvas_width = parseInt(canvas.attr('width'));
    canvas_height = parseInt(canvas.attr('height'));
    canvas_height_m = canvas_height / scale;
    /* 
    //If mouse is moving over the thing
    $(canvas).mousemove(function(e) 
    {
        var p = get_real(new b2Vec2(e.pageX/scale, e.pageY/scale))
         
        mouse_x = p.x;
        mouse_y = p.y;
         
        if(mouse_pressed && !mouse_joint)
        {
            var body = GetBodyAtMouse();
             
            if(body)
            {
                //if joint exists then create
                var def = new b2MouseJointDef();
                 
                def.bodyA = ground;
                def.bodyB = body;
                def.target = p;
                 
                def.collideConnected = true;
                def.maxForce = 1000 * body.GetMass();
                def.dampingRatio = 0;
                 
                mouse_joint = world.CreateJoint(def);
                 
                body.SetAwake(true);
            }
        }
        else
        {
            //nothing
        }
         
        if(mouse_joint)
        {
            mouse_joint.SetTarget(p);
        }
    });
     
    $(canvas).mousedown(function() 
    {
        //flag to indicate if mouse is pressed or not
        mouse_pressed = true;
    });
     */
    /*
        When mouse button is release, mark pressed as false and delete the mouse joint if it exists
    */
    /*
    $(canvas).mouseup(function() 
    {
        mouse_pressed = false;
         
        if(mouse_joint)
        {
            world.DestroyJoint(mouse_joint);
            mouse_joint = false;
        }
    });
     */
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
        var xhead = e.x/11*scale+scale/2;        
        var yhead = e.y*-1+scale/2+5;        
        $('.x-head').html(xhead);
        $('.y-head').html(yhead);
        var p = get_real(new b2Vec2(xhead, yhead));
         
        mouse_x = p.x;
        mouse_y = p.y;
         
        if(!mouse_joint)
        {
            var body = superball;
             
            if(body)
            {
                //if joint exists then create
                var def = new b2MouseJointDef();
                 
                def.bodyA = ground;
                def.bodyB = body;
                
                firstTar = superball.GetPosition();
                //fp = get_real(new b2Vec2(firstTar.x, firstTar.y));
                fp = new b2Vec2(firstTar.x, firstTar.y);
                //fp = p;
                def.target = fp;
                 
                def.collideConnected = true;
                def.maxForce = 1000 * body.GetMass();
                def.dampingRatio = 0;
                 
                mouse_joint = world.CreateJoint(def);
                 
                body.SetAwake(true);
            }
        }
        else
        {
            //nothing
        }
         
        if(mouse_joint)
        {
            mouse_joint.SetTarget(p);
        }
    });

    document.addEventListener('keydown', function(e){
        if(e.keyCode==16){
            mouse_pressed = true;
        }
    });

    document.addEventListener('keyup', function(e){
        if(e.keyCode==16){
            mouse_pressed = false;
             
            if(mouse_joint)
            {
                world.DestroyJoint(mouse_joint);
                mouse_joint = false;
            }
        }
    });
});

(function(){
 //BEGIN LIBRARY CODE
            var loser = ["You Lose!", "Casi... pero no.", "Que lastima", "Suerte la proxima", "Hasta la vista baby", "jaja... loser", "Manco", "Pecheaste", "Dedicate a otra cosa", "Tendra solucion?"]
            var x = 138;
            var y = 150;
            var dx = 2;
            var dy = 4;
            var WIDTH;
            var HEIGHT;
            var ctx;
            var paddlex;
            var paddleh;
            var paddlew;
            var intervalId;
            var rightDown = false;
            var leftDown = false;
            var gameRun = false;
            var faceRun = false;
            //BRICKS
            var bricks  = [],
                NROWS   = 5,
                NCOLS   = 5,
                PADDING = 1,
                BRICKH  = 15,
                BRICKW;
            var bricksColors = ["#ff1c0a","#fffd0a","#00a308","#0008db","#eb0093"]

            function init_bricks(){
                BRICKW = (WIDTH/NCOLS)-1;
                
                for(var i=0;i<NROWS;i++){
                    bricks[i] = [];
                    for(var j=0;j<NCOLS;j++){
                        bricks[i][j] = 1;    
                    }
                }    
            }

            function init_paddle(){
                paddlex = WIDTH/2;
                paddleh = 10;
                paddlew = 125;
            }

            function init() {
              ctx = document.getElementById("canvas-ark").getContext("2d");
              WIDTH = 300;
              HEIGHT = 300;
              return setInterval(draw, 10);
            }

            function circle(x,y,r) {
              ctx.fillStyle = "#888";  
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI*2, true);
              ctx.closePath();
              ctx.fill();
            }

            function rect(x,y,w,h) {
              ctx.beginPath();
              ctx.rect(x,y,w,h);
              ctx.closePath();
              ctx.fill();
            }

            function clear() {
              ctx.clearRect(0, 0, WIDTH, HEIGHT);
            }

            function checkWinner() {
                var findOne = false;

                for(var i=0;i<bricks.length;i++){
                   for(var j=0;j<bricks[i].length;j++){
                     if(bricks[i][j]==1){
                    findOne = true;
                    break;
                     }
                   }
                }

                if(!findOne){
                    setTimeout(function(){
                        clearInterval(intervalId);
                        msgDraw("You Win!");
                        gameRun = false;
                        $('#play-again').show();
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
              ctx.fillStyle = "#000";
              ctx.font="30px Arial";
              ctx.textAlign = 'center';
              ctx.fillText(m,WIDTH/2,HEIGHT/2);
            }
            //END LIBRARY CODE

            function draw() {
              clear();
              circle(x, y, 10);
              
              if(rightDown && paddlex < WIDTH-paddlew){
                paddlex += 5;
              }
              if(leftDown && paddlex > 1){
                paddlex -= 5; 
              }
              rect(paddlex,HEIGHT-paddleh,paddlew,paddleh);

              //draw bricks
              for(var i=0;i<NROWS;i++){
                ctx.fillStyle = bricksColors[i];  
                for(var j=0;j<NCOLS;j++){
                    if(bricks[i][j]==1){
                        //dibujalo
                        rect(j*(BRICKW+PADDING)+PADDING,i*(BRICKH+PADDING)+PADDING,BRICKW,BRICKH);    
                    }
                }
              }

              //bricks collisions
              rowheight = BRICKH + PADDING;
              rowwidth = BRICKW + PADDING;
              row = Math.floor(y/rowheight);
              col = Math.floor(x/rowwidth);
             
              if(y<NROWS*rowheight && row >=0 && col >=0 && bricks[row][col]==1){
                 dy = -dy;
                 bricks[row][col]=0; 
                 checkWinner();
                 //bricks[2][0]=1; 
              } 

              if (x + dx > WIDTH || x + dx < 0){
                dx = -dx;
              }

              if (y + dy < 0){
                dy = -dy;
              }else if(y + dy > HEIGHT){
                if(x>paddlex&&x<paddlex+paddlew){
                    dy = -dy;
                }else{
                    //dy = -dy;
                    clearInterval(intervalId);
                    msgDraw(loser[parseInt(Math.random()*loser.length)]);
                    gameRun = false;
                    $('#play-again').show();
                }    
              }
             
              x += dx;
              y += dy;
            }

            function startGame(){
                if(!gameRun){
                    x = 138;
                    y = 150;
                    dx = 2;
                    dy = 4;
                    intervalId = init();
                    init_bricks();
                    init_paddle();
                    gameRun = true;
                    $('#play-again').hide()
                }
            }

            $(document).ready(function(){
                $(document).keydown(function(e){
                    if(e.keyCode==39){
                        rightDown = true;
                    }

                    if(e.keyCode==37){
                        leftDown = true;
                    }
                });

                $(document).keyup(function(e){
                    if(e.keyCode==39){
                        rightDown = false;
                    }

                    if(e.keyCode==37){
                        leftDown = false;
                    }
                });

                $('#play-again a').click(function(e){
                    startGame();            
                });

                document.addEventListener('headtrackingEvent',  function(e){
                   console.log(e) 
                   if(!gameRun && !faceRun){
                    faceRun = true;
                    //Arrancar
                    startGame();
                   }
                   var xhead = parseInt(e.x*10);        
                   $('.paddle-move').text(xhead);
                   $('.paddle').text(paddlex);
                   if(paddlex > 1 && paddlex < WIDTH-paddlew){
                     diff = WIDTH/2+xhead; 
                     paddlex = (diff<=1)?2:((diff>=WIDTH-paddlew)?WIDTH-paddlew-1:diff); 
                   }
                });
            });
})();

