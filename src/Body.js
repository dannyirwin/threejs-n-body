import * as THREE from 'three';
import { SphereBufferGeometry, Vector3 } from 'three';

const G = 0.00001;

class Body extends THREE.Mesh {
  constructor(position, velocity, mass = 20) {
    const radius = ((((3 * mass) / 4) * Math.PI) ** 0.33333333) ** 0.9;
    const geometry = new SphereBufferGeometry(radius, 32, 32);
    const material =
      mass > 0
        ? new THREE.MeshBasicMaterial({ color: 0xeeffee })
        : new THREE.MeshStandardMaterial({ color: 0x335599 });
    super(geometry, material);

    this.position.add(position);
    this.velocity = velocity || new THREE.Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.mass = mass;
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0);
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
      (G * this.mass * otherBody.mass) / distanceSq < 0.1 ? 0.1 : distanceSq;
    force.multiplyScalar(strength / 1000);
    this.applyForce(force);
  }
}

export default Body;
