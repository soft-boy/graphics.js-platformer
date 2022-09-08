var PLAYER_X_SPEED = 7;
var GRAVITY = 30;
var JUMP_SPEED = 17;
var WOBBLE_SPEED = 8
var WOBBLE_DIST = 0.07;

export function overlap(actor1, actor2) {
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y;
}

export class Vec {
  constructor(x, y) {
    this.x = x; this.y = y;
  }

  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }

  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}

export class Player {
  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
    this.size = new Vec(0.8, 1.5);
  }

  get type() { return "player"; }

  static create(pos) {
    return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));
  }

  update(world, time, isKeyPressed) {
    let xSpeed = 0;

    if (isKeyPressed('left')) xSpeed -= PLAYER_X_SPEED;
    if (isKeyPressed('right')) xSpeed += PLAYER_X_SPEED;

    let pos = this.pos;
    let movedX = pos.plus(new Vec(xSpeed * time, 0));

    if (!world.level.touches(movedX, this.size, "wall")) {
      pos = movedX;
    }
  
    let ySpeed = this.speed.y + time * GRAVITY;
    let movedY = pos.plus(new Vec(0, ySpeed * time));

    if (!world.level.touches(movedY, this.size, "wall")) {
      pos = movedY;
    }
    else if (isKeyPressed('up') && ySpeed > 0) {
      ySpeed = -JUMP_SPEED;
    }
    else {
      ySpeed = 0;
    }

    return new Player(pos, new Vec(xSpeed, ySpeed));
  };
}

export class Lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
    this.size = new Vec(1, 1);
  }

  get type() { return "lava"; }

  static create(pos, ch) {
    if (ch == "=") {
      return new Lava(pos, new Vec(2, 0));
    }
    else if (ch == "|") {
      return new Lava(pos, new Vec(0, 2));
    }
    else if (ch == "v") {
      return new Lava(pos, new Vec(0, 3), pos);
    }
  }

  collide(world) {
    world.status = 'lost'
  };

  update(world, time) {
    let newPos = this.pos.plus(this.speed.times(time));
    if (!world.level.touches(newPos, this.size, "wall")) {
      return new Lava(newPos, this.speed, this.reset);
    }
    else if (this.reset) {
      return new Lava(this.reset, this.speed, this.reset);
    } 
    else {
      return new Lava(this.pos, this.speed.times(-1));
    }
  };
}

export class Coin {
  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
    this.size = new Vec(0.6, 0.6);
  }

  get type() { return "coin"; }

  static create(pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
  }

  collide(world) {
    world.actors = world.actors.filter(a => a != this);
    if (!world.actors.some(a => a.type == "coin")) world.status = "won";
  };

  update(world, time) {
    let wobble = this.wobble + time * WOBBLE_SPEED;
    let wobblePos = Math.sin(wobble) * WOBBLE_DIST;
    return new Coin(this.basePos.plus(new Vec(0, wobblePos)),
      this.basePos, wobble);
  };
}

const levelChars = {
  ".": "empty",
  "#": "wall",
  "+": "lava",
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Lava
};

export class Level {
  constructor(plan) {
    let rows = plan.trim().split("\n").map(l => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];
        if (typeof type == "string") return type;
        this.startActors.push(type.create(new Vec(x, y), ch));

        return "empty";
      });
    });
  }

  touches(pos, size, type) {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let isOutside = x < 0 ||
          x >= this.width ||
          y < 0 ||
          y >= this.height;
        let here = isOutside ? "wall" : this.rows[y][x];
        if (here == type) return true;
      }
    }
    return false;
  }
}
