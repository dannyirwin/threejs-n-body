import { Vector3 } from 'three';
import Body from './Body';

export const buildDevSystem = (n = 1000) => {
  const colors = [0xeeffee, 0x052f5f, 0x0044577, 0x06a77d, 0xd5c67a, 0xf1a208];

  const bodies = [];
  for (let i = 0; i < n; i++) {
    const i = Math.floor(Math.random() * colors.length);
    const color = colors[i];

    const pos = new Vector3(7000, 0, 0);

    const vel = new Vector3(0, 1, 0);
    vel.setLength(20000);

    const mass = 2000 + Math.random() * 10000;
    bodies.push(new Body(pos, vel, mass, { color }));
  }

  const distance = 3000;
  const vert = distance * Math.sqrt(3);
  const bigBody = new Body(
    new Vector3(3000, 0, 0),
    new Vector3(0, -3, 0),
    1000000000,
    { color: colors[2] }
  );

  const bigBody2 = new Body(
    new Vector3(-3000, 0, 0),
    new Vector3(0, 3, 0),
    1000000000,
    { color: colors[5] }
  );

  const bigBody3 = new Body(
    new Vector3(0, vert, 0),
    new Vector3(-10, 0, 0),
    1000000000,
    { color: colors[3] }
  );
  const bigBody4 = new Body(
    new Vector3(10000, 0, 0),
    new Vector3(0, 20, 0),
    100000000,
    { color: colors[4] }
  );

  bodies.push(bigBody);
  bodies.push(bigBody2);
  bodies.push(bigBody3);
  bodies.push(bigBody4);
  return [bodies, new Vector3(0, 0, 8000)];
};

export const buildDualGalaxy = (n = 1000) => {
  const allBodies = [];
  const center1 = initialCenterBody(500);
  const center2 = initialCenterBody(0.9);
  center1.position.set(0, 0, 0);
  center2.position.set(-20000, 0, 0);
  //   center1.velocity.set(0, -10, 0);
  center2.velocity.set(0, 10, 1);
  center2.velocity.setLength(30);
  center1.mass *= 0.7;

  const [bodies1] = buildStableSwirl(n / 2, center1, 1, 10000);
  const [bodies2] = buildStableSwirl(n / 2, center2, -1);
  allBodies.push(bodies1);
  allBodies.push(bodies2);

  return [allBodies.flat(), new Vector3(0, 0, 20000)];
};

const initialCenterBody = (massScale = 1) =>
  new Body(new Vector3(0, 0, 0), new Vector3(0, 0, 0), 1000000000 * massScale, {
    color: 0xeeffee
  });

export const buildStableSwirl = (
  n = 1000,
  centerBody = initialCenterBody(),
  direction = 1,
  offset = 7000
) => {
  const colors = [0xeeffee, 0x052f5f, 0x005377, 0x06a77d, 0xd5c67a, 0xf1a208];

  const bodies = [];
  for (let i = 0; i < n; i++) {
    const i = Math.floor(Math.random() * colors.length);
    const color = colors[i];

    const pos = centerBody.position
      .clone()
      .add(
        new Vector3(
          (offset + Math.random() * 100) * direction,
          Math.random() * 100 - 50,
          0
        )
      );

    const vel = new Vector3(0.1, 10 * direction, 0.1);
    vel.setLength(100);
    vel.add(centerBody.velocity);

    const mass = 2000 + Math.random() * 300000;
    bodies.push(new Body(pos, vel, mass, { color }));
  }

  bodies.push(centerBody);
  return [bodies, new Vector3(0, 0, 8000)];
};
