export function shiftViewport(world) {
  let view = world.viewport
  let margin = view.width / 3;
  let player = world.getPlayer();
  let center = player.pos.plus(player.size.times(0.5));

  if (center.x < view.left + margin) {
    view.left = Math.max(center.x - margin, 0);
  }
  else if (center.x > view.left + view.width - margin) {
    view.left = Math.min(
      center.x + margin - view.width,
      world.level.width - view.width
    );
  }
  if (center.y < view.top + margin) {
    view.top = Math.max(center.y - margin, 0);
  }
  else if (center.y > view.top + view.height - margin) {
    view.top = Math.min(
      center.y + margin - view.height,
      world.level.height - view.height
    );
  }
}