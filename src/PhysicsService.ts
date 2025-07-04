import * as THREE from 'three';
import { Node } from './node.interface';

export class PhysicsService {
  /**
   * Calculates compatibility between preferences and traits objects.
   * Returns a value between 0 and 1 (higher is more compatible).
   */
  static calculateCompatibility(preferences: { [key: string]: number }, traits: { [key: string]: number }): number {
    const keys = Object.keys(preferences);
    if (keys.length === 0) return 0;
    let score = 0;
    for (const key of keys) {
      if (traits.hasOwnProperty(key)) {
        score += 100 - Math.abs(preferences[key] - traits[key]);
      }
    }
    return score / keys.length / 100; // Normalize to 0-1
  }

  /**
   * Calculates similarity between two traits objects (cosine similarity).
   * Returns a value between -1 and 1.
   */
  static calculateSimilarity(a: { [key: string]: number }, b: { [key: string]: number }): number {
    const keys = Object.keys(a);
    if (keys.length === 0) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (const key of keys) {
      dot += (a[key] || 0) * (b[key] || 0);
      magA += (a[key] || 0) ** 2;
      magB += (b[key] || 0) ** 2;
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  /**
   * Calculates Hooke-law spring force from center to node.
   * F = -k * (|x - x0| - restLength) * direction
   */
  static calculateSpringForce(centerPos: THREE.Vector3, nodePos: THREE.Vector3, k: number, restLength: number): THREE.Vector3 {
    const dir = centerPos.clone().sub(nodePos);
    const dist = dir.length();
    if (dist === 0) return new THREE.Vector3();
    const forceMag = k * (dist - restLength);
    return dir.normalize().multiplyScalar(forceMag);
  }

  /**
   * Computes forces on each node due to the central node and other nodes.
   * Attraction: centralNode.preferences vs outerNode.traits
   * Repulsion: between outer nodes, based on traits similarity only
   */
  static computeForces(nodes: Node[], central: Node, constants: { k: number; kRep: number }): Map<Node, THREE.Vector3> {
    const forces = new Map<Node, THREE.Vector3>();
    const restLength = 40; // should match scene layout
    for (const node of nodes) {
      let force = new THREE.Vector3();
      // Attraction to central node (Hooke-law spring, modulated by compatibility)
      if (central.preferences && node.traits && node !== central && node.mesh && central.mesh) {
        const compatibility = this.calculateCompatibility(central.preferences, node.traits);
        // Spring constant modulated by compatibility (0.2x to 1x)
        const springK = constants.k * (0.2 + 0.8 * compatibility);
        const springForce = this.calculateSpringForce(central.mesh.position, node.mesh.position, springK, restLength);
        force.add(springForce);
      }
      // Repulsion from other nodes (traits similarity)
      for (const other of nodes) {
        if (other === node) continue;
        if (node.traits && other.traits && node.mesh && other.mesh) {
          const similarity = this.calculateSimilarity(node.traits, other.traits);
          // Repulsion force inversely proportional to similarity
          const toOther = node.mesh.position.clone().sub(other.mesh.position);
          const d = toOther.length();
          if (d > 0 && d < restLength * 0.9) {
            force.add(toOther.normalize().multiplyScalar(constants.kRep * (1 - similarity) * (restLength * 0.9 - d)));
          }
        }
      }
      forces.set(node, force);
    }
    return forces;
  }
}
