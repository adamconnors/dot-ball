import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private spawnSound: HTMLAudioElement;
  private collisionSound: HTMLAudioElement;

  constructor() {
    // Create audio elements
    this.spawnSound = new Audio('assets/sounds/spawn.mp3');
    this.collisionSound = new Audio('assets/sounds/collision.mp3');

    // Preload sounds
    this.spawnSound.load();
    this.collisionSound.load();

    // Set volume
    this.spawnSound.volume = 0.3;
    this.collisionSound.volume = 0.2;
  }

  playSpawnSound() {
    // Reset the sound to the beginning if it's already playing
    this.spawnSound.currentTime = 0;
    this.spawnSound.play().catch(e => console.log('Audio play failed:', e));
  }

  playCollisionSound() {
    // Reset the sound to the beginning if it's already playing
    this.collisionSound.currentTime = 0;
    this.collisionSound.play().catch(e => console.log('Audio play failed:', e));
  }
} 