import {
  fillRectangle,
  getElapsedTime,
  loadImage,
  makeGraphicsWindow,
  runGraphics,
} from '@soft-boy/graphics.js'
import {
  Level,
  State
} from './models.js'
import { plans } from './levels.js'

const screenWidth = 600
const screenHeight = 450
const scale = 20
const playerXOverlap = 4;

makeGraphicsWindow(screenWidth, screenHeight, document.getElementById('canvas'))

const graphics = window._graphics

function initLevel(level) {
  if (level < plans.length) {
    world.level = new Level(plans[level])
    world.state = State.start(world.level);
  }
  else {
    alert("You've won!")
  }
}

function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

// this function is called once to initialize your new world
async function startWorld(world) {
  world.levelIndex = 0
  initLevel(world.levelIndex)

  world.timeStamp = 0
  world.keys = []
  world.flipPlayer = false;
  world.viewport = {
    left: 0,
    top: 0,
    width: screenWidth / scale,
    height: screenHeight / scale
  };

  world.otherSprites = await loadImage(require('../img/sprites.png'))
  world.playerSprites = await loadImage(require('../img/player.png'))
}

// this function is called every frame to update your world
function updateWorld(world) {
  const timeDiff = getElapsedTime() - world.timeStamp
  world.state = world.state.update(timeDiff/1000, graphics.keysDown);

  let view = world.viewport, margin = view.width / 3;
  let player = world.state.player;
  let center = player.pos.plus(player.size.times(0.5));

  if (center.x < view.left + margin) {
    view.left = Math.max(center.x - margin, 0);
  } else if (center.x > view.left + view.width - margin) {
    view.left = Math.min(
      center.x + margin - view.width,
      world.state.level.width - view.width
    );
  }
  if (center.y < view.top + margin) {
    view.top = Math.max(center.y - margin, 0);
  } else if (center.y > view.top + view.height - margin) {
    view.top = Math.min(
      center.y + margin - view.height,
      world.state.level.height - view.height
    );
  }

  if (world.state.status == "won") {
    world.levelIndex++
    initLevel(world.levelIndex)
  }

  world.timeStamp = getElapsedTime()
}

function drawBackground(world) {
  let {left, top, width, height} = world.viewport;
  let xStart = Math.floor(left);
  let xEnd = Math.ceil(left + width);
  let yStart = Math.floor(top);
  let yEnd = Math.ceil(top + height);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let tile = world.level.rows[y][x];
      if (tile == "empty") continue;
      let screenX = (x - left) * scale;
      let screenY = (y - top) * scale;
      let tileX = tile == "lava" ? scale : 0;
      graphics.ctx.drawImage(
        world.otherSprites,
        tileX,
        0,
        scale,
        scale,
        screenX,
        screenY,
        scale,
        scale
      );
    }
  }
}

function drawPlayer(world, player, x, y, width, height) {
  width += playerXOverlap * 2;
  x -= playerXOverlap;
  if (player.speed.x != 0) {
    world.flipPlayer = player.speed.x < 0;
  }

  let tile = 8;
  if (player.speed.y != 0) {
    tile = 9;
  } else if (player.speed.x != 0) {
    tile = Math.floor(Date.now() / 60) % 8;
  }

  graphics.ctx.save();
  if (world.flipPlayer) {
    flipHorizontally(graphics.ctx, x + width / 2);
  }
  let tileX = tile * width;
  graphics.ctx.drawImage(
    world.playerSprites,
    tileX,
    0,
    width,
    height,
    x,
    y,
    width,
    height
  );
  graphics.ctx.restore();
};

function drawActors(world) {
  for (let actor of world.state.actors) {
    let width = actor.size.x * scale;
    let height = actor.size.y * scale;
    let x = (actor.pos.x - world.viewport.left) * scale;
    let y = (actor.pos.y - world.viewport.top) * scale;
    if (actor.type == "player") {
      drawPlayer(world, actor, x, y, width, height);
    } else {
      let tileX = (actor.type == "coin" ? 2 : 1) * scale;
      graphics.ctx.drawImage(
        world.otherSprites,
        tileX,
        0,
        width,
        height,
        x,
        y,
        width,
        height
      );
    }
  }
};

// this function is called every frame to draw your world
function drawWorld(world) {
  let color

  if (world.status == "won") {
    color = "rgb(68, 191, 255)";
  } else if (status == "lost") {
    color = "rgb(44, 136, 214)";
  } else {
    color = "rgb(52, 166, 251)";
  }

  fillRectangle(0, 0, screenWidth, screenHeight, color)
  drawBackground(world)
  drawActors(world)
}

runGraphics(startWorld, updateWorld, drawWorld)