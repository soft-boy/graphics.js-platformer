const PLAYER_X_OVERLAP = 4;
const SCALE = 20

function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

export function drawBackground(world) {
  let {left, top, width, height} = world.viewport;
  let xStart = Math.floor(left);
  let xEnd = Math.ceil(left + width);
  let yStart = Math.floor(top);
  let yEnd = Math.ceil(top + height);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let tile = world.level.rows[y][x];
      if (tile == "empty") continue;
      let screenX = (x - left) * SCALE;
      let screenY = (y - top) * SCALE;
      let tileX = tile == "lava" ? SCALE : 0;
      window._graphics.ctx.drawImage(
        world.otherSprites,
        tileX,
        0,
        SCALE,
        SCALE,
        screenX,
        screenY,
        SCALE,
        SCALE
      );
    }
  }
}

export function drawPlayer(world, player, x, y, width, height) {
  width += PLAYER_X_OVERLAP * 2;
  x -= PLAYER_X_OVERLAP;
  if (player.speed.x != 0) {
    world.flipPlayer = player.speed.x < 0;
  }

  let tile = 8;
  if (player.speed.y != 0) {
    tile = 9;
  } else if (player.speed.x != 0) {
    tile = Math.floor(Date.now() / 60) % 8;
  }

  window._graphics.ctx.save();
  if (world.flipPlayer) {
    flipHorizontally(window._graphics.ctx, x + width / 2);
  }
  let tileX = tile * width;
  window._graphics.ctx.drawImage(
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
  window._graphics.ctx.restore();
};

export function drawActors(world) {
  for (let actor of world.actors) {
    let width = actor.size.x * SCALE;
    let height = actor.size.y * SCALE;
    let x = (actor.pos.x - world.viewport.left) * SCALE;
    let y = (actor.pos.y - world.viewport.top) * SCALE;
    if (actor.type == "player") {
      drawPlayer(world, actor, x, y, width, height);
    } else {
      let tileX = (actor.type == "coin" ? 2 : 1) * SCALE;
      window._graphics.ctx.drawImage(
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
