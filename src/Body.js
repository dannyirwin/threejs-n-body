import * as THREE from 'three';
import { SphereBufferGeometry, Vector3 } from 'three';

class Body extends THREE.Mesh {
  constructor(position, velocity, mass = 20, options) {
    const {
      usePointLight = true,
      G = 0.000005,
      scene,
      color = 0xeeffee
    } = options || {};
    const radius = ((((3 * mass) / 4) * Math.PI) ** 0.33333333) ** 0.9;
    const geometry = new SphereBufferGeometry(radius, 32, 32);
    const material =
      mass > 0
        ? new THREE.MeshBasicMaterial({ color })
        : new THREE.MeshStandardMaterial({ color: 0x335599 });
    super(geometry, material);

    this.position.add(position);
    this.velocity = velocity || new THREE.Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.mass = mass;

    this.G = G;
    this.light = usePointLight
      ? new THREE.PointLight(color, 1.4, radius * 500, 1)
      : undefined;
    this.light && this.light.position.add(this.position);
    this.light && scene && scene.add(this.light);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0);
    this.light &&
      this.light.position.set(
        this.position.x,
        this.position.y,
        this.position.z
      );
  }

  applyForce(force) {
    force.divideScalar(this.mass);
    this.acceleration.add(force);
  }

  attract(otherBody) {
    let force = new Vector3();
    force.subVectors(otherBody.position, this.position).normalize();
    let distanceSq = this.position.distanceToSquared(otherBody.position);
    let strength =
      (this.G * this.mass * otherBody.mass) / distanceSq < 0.1
        ? 0.1
        : distanceSq;
    force.multiplyScalar(strength / 1000);
    this.applyForce(force);
  }
}

export default Body;
