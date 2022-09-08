import {
  makeGraphicsWindow,
  runGraphics,
  fillRectangle,
  getElapsedTime,
  isKeyPressed,
  loadImage
} from '@soft-boy/graphics.js'
import { levelPlans } from './levels.js'
import { shiftViewport } from './viewport.js'
import { overlap, Level } from './models.js'
import { drawBackground, drawActors } from './draw.js'

const SCREEN_WIDTH = 600
const SCREEN_HEIGHT = 450
const SCALE = 20

makeGraphicsWindow(SCREEN_WIDTH, SCREEN_HEIGHT, document.getElementById('canvas'))

// this function is called once to initialize your new world
async function startWorld(world) {
  world.otherSprites = await loadImage(require('../img/sprites.png'))
  world.playerSprites = await loadImage(require('../img/player.png'))

  world.timeStamp = 0
  world.levelIndex = 0
  world.level = new Level(levelPlans[world.levelIndex])
  world.actors = world.level.startActors;
  world.status = 'playing';
  world.flipPlayer = false;
  world.viewport = {
    left: 0,
    top: 0,
    width: SCREEN_WIDTH / SCALE,
    height: SCREEN_HEIGHT / SCALE
  };

  world.getPlayer = function() {
    return this.actors.find(a => a.type == "player")
  }
}

// this function is called every frame to update your world
function updateWorld(world) {
  const timediff = (getElapsedTime() - world.timeStamp) / 1000
  world.actors = world.actors.map(actor => actor.update(world, timediff, isKeyPressed));

  if (world.status == "playing") {
    let player = world.getPlayer();
    
    if (world.level.touches(player.pos, player.size, "lava")) {
      world.status = 'lost'
    }
  
    for (let actor of world.actors) {
      if (actor != player && overlap(actor, player)) {
        actor.collide(world);
      }
    }
  }

  shiftViewport(world);

  if (world.status == 'won') {
    world.levelIndex++
    world.level = new Level(levelPlans[world.levelIndex])
    world.actors = world.level.startActors;
    world.status = 'playing';
  }

  world.timeStamp = getElapsedTime()
}

// this function is called every frame to draw your world
function drawWorld(world) {
  let bgColor
  if (world.status == 'won') bgColor = 'rgb(68, 191, 255)'
  else if (world.status == 'lost') bgColor = 'rgb(44, 136, 214)'
  else bgColor = 'rgb(52, 166, 251)'

  fillRectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, bgColor)
  drawBackground(world)
  drawActors(world)
}

runGraphics(startWorld, updateWorld, drawWorld)