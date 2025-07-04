import * as THREE from 'three';

export interface Node {
  id: string;
  traits: { [key: string]: number };
  preferences: { [key: string]: number };
  velocity: THREE.Vector3;
  mesh?: THREE.Mesh;
}
