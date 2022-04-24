import { Octree } from '@brakebein/threeoctree';
import { Vector3 } from 'three';
import * as THREE from 'three';

const defaultParams = {
  octreeParams: { objectsThreshold: 8, overlapPct: 0.15 }
};

export class System {
  constructor(scene, bodies = [], { octreeParams } = defaultParams) {
    this.bodies = new Octree(octreeParams);
    this.centerOfMass = new Vector3();
    this.massPosition = new Vector3();
    this.totalMass = 0;
    this.scene = scene;

    bodies.map(body => this.addBody(body));
  }

  addBody(body) {
    this.massPosition.add(body.position.clone().multiplyScalar(body.mass));
    this.totalMass += body.mass;
    this.centerOfMass = this.massPosition.clone().divideScalar(this.totalMass);
    this.scene.add(body);
    this.bodies.add(body);
    this.bodies.rebuild();
    this.bodies.update();
  }

  update() {
    this.attractObjects();
    this.bodies.objects.map(body => body.update());
  }

  attractObjects() {
    const nodeIds = {};
    this.totalMass = 0;
    this.massPosition = new Vector3();
    this.bodies.objectsData.map(({ node, object }) => {
      if (!nodeIds[node.id]) {
        nodeIds[node.id] = true;

        let totalMassPosition = new Vector3(0, 0, 0);
        let totalMass = 0;

        node.objects.map(otherObject => {
          const massPosition = otherObject.object.position
            .clone()
            .multiplyScalar(otherObject.object.mass);
          totalMassPosition.add(massPosition);
          totalMass += otherObject.object.mass;
          if (otherObject.object !== object) {
            object.attract(otherObject.object);
          }
        });

        this.massPosition.add(totalMassPosition);
        this.totalMass += totalMass;

        const centerOfMass = totalMassPosition.divideScalar(totalMass);
        const gravityNode = {
          position: centerOfMass,
          mass: totalMass
        };

        this.bodies.objects.map(body => {
          body.attract(gravityNode);
        });

        // const geometry = new THREE.SphereGeometry(
        //   (((3 * totalMass) / 4) * Math.PI) ** 0.33333333 * 2,
        //   32,
        //   16
        // );
        // const material = new THREE.MeshBasicMaterial({
        //   color: 0xff0000,
        //   opacity: 0.2
        // });
        // const sphere = new THREE.Mesh(geometry, material);
        // sphere.position.set(centerOfMass.x, centerOfMass.y, centerOfMass.z);
        // this.scene.add(sphere);
        // spheres.push(sphere);
        return;
      }
      node.objects.map(otherObject => {
        if (otherObject.object !== object) {
          object.attract(otherObject.object);
        }
      });
    });

    this.centerOfMass = this.massPosition.divideScalar(this.totalMass);
    this.bodies.update();
    this.bodies.rebuild();

    // const geometry = new THREE.SphereGeometry(
    //   (((3 * this.totalMass) / 4) * Math.PI) ** 0.33333333 * 2,
    //   32,
    //   16
    // );
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    //   opacity: 0.2
    // });
    // const sphere = new THREE.Mesh(geometry, material);
    // sphere.position.set(
    //   this.centerOfMass.x,
    //   this.centerOfMass.y,
    //   this.centerOfMass.z
    // );
    // this.scene.add(sphere);
    // // spheres.push(sphere);
  }
}
