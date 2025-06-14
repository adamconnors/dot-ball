import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Asteroid {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AppComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) 
  canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private spaceship = {
    x: 0,
    y: 0,
    radius: 15
  };
  private asteroids: Asteroid[] = [];
  private readonly NUM_ASTEROIDS = 20;
  private readonly ASTEROID_SPEED = 4;
  private readonly ASTEROID_RADIUS = 15;
  public gameOver = false;
  private spawnInterval: any;
  private gameStartTime: number = 0;
  private survivalTime: number = 0;
  public gameStarted = false;

  ngOnInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
  }

  ngOnDestroy() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }
  }

  startGame() {
    this.gameStarted = true;
    this.gameOver = false;
    this.asteroids = [];
    this.gameStartTime = Date.now();
    this.survivalTime = 0;
    
    // Add game-active class to canvas
    this.canvasRef.nativeElement.classList.add('game-active');
    
    // Initialize asteroids
    this.initializeAsteroids();
    
    // Start asteroid spawning
    this.startAsteroidSpawning();
    
    // Start game loop
    this.gameLoop();
  }

  private startAsteroidSpawning() {
    this.spawnInterval = setInterval(() => {
      this.spawnAsteroid();
    }, 5000);
  }

  private spawnAsteroid() {
    // Randomly choose which edge to spawn from (0: top, 1: right, 2: bottom, 3: left)
    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;  // Initialize variables

    switch (edge) {
      case 0: // top
        x = Math.random() * window.innerWidth;
        y = -this.ASTEROID_RADIUS;
        break;
      case 1: // right
        x = window.innerWidth + this.ASTEROID_RADIUS;
        y = Math.random() * window.innerHeight;
        break;
      case 2: // bottom
        x = Math.random() * window.innerWidth;
        y = window.innerHeight + this.ASTEROID_RADIUS;
        break;
      case 3: // left
        x = -this.ASTEROID_RADIUS;
        y = Math.random() * window.innerHeight;
        break;
    }

    // Calculate direction towards current pointer position
    const dx = this.spaceship.x - x;
    const dy = this.spaceship.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize and scale the velocity
    const speed = this.ASTEROID_SPEED;
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    this.asteroids.push({
      x,
      y,
      dx: vx,
      dy: vy,
      radius: this.ASTEROID_RADIUS
    });
  }

  @HostListener('window:resize')
  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.gameStarted && !this.gameOver) {
      this.spaceship.x = event.clientX;
      this.spaceship.y = event.clientY;
    }
  }

  private initializeAsteroids() {
    for (let i = 0; i < this.NUM_ASTEROIDS; i++) {
      this.asteroids.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        dx: (Math.random() - 0.5) * this.ASTEROID_SPEED,
        dy: (Math.random() - 0.5) * this.ASTEROID_SPEED,
        radius: this.ASTEROID_RADIUS
      });
    }
  }

  private checkAsteroidCollision(a1: Asteroid, a2: Asteroid) {
    const dx = a2.x - a1.x;
    const dy = a2.y - a1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < a1.radius + a2.radius) {
      // Calculate collision normal
      const nx = dx / distance;
      const ny = dy / distance;
      
      // Calculate relative velocity
      const relativeVelocityX = a2.dx - a1.dx;
      const relativeVelocityY = a2.dy - a1.dy;
      
      // Calculate relative velocity in terms of the normal direction
      const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;
      
      // Do not resolve if velocities are separating
      if (velocityAlongNormal > 0) return;
      
      // Calculate restitution
      const restitution = 0.5;
      
      // Calculate impulse scalar
      const impulseScalar = -(1 + restitution) * velocityAlongNormal;
      
      // Apply impulse
      a1.dx -= impulseScalar * nx;
      a1.dy -= impulseScalar * ny;
      a2.dx += impulseScalar * nx;
      a2.dy += impulseScalar * ny;
      
      // Normalize velocities to maintain constant speed
      const speed1 = Math.sqrt(a1.dx * a1.dx + a1.dy * a1.dy);
      const speed2 = Math.sqrt(a2.dx * a2.dx + a2.dy * a2.dy);
      
      if (speed1 > 0) {
        a1.dx = (a1.dx / speed1) * this.ASTEROID_SPEED;
        a1.dy = (a1.dy / speed1) * this.ASTEROID_SPEED;
      }
      
      if (speed2 > 0) {
        a2.dx = (a2.dx / speed2) * this.ASTEROID_SPEED;
        a2.dy = (a2.dy / speed2) * this.ASTEROID_SPEED;
      }
      
      // Move asteroids apart to prevent sticking
      const overlap = (a1.radius + a2.radius - distance) / 2;
      a1.x -= overlap * nx;
      a1.y -= overlap * ny;
      a2.x += overlap * nx;
      a2.y += overlap * ny;
    }
  }

  private updateAsteroids() {
    // Update positions and check wall collisions
    this.asteroids.forEach(asteroid => {
      asteroid.x += asteroid.dx;
      asteroid.y += asteroid.dy;

      // Bounce off walls
      if (asteroid.x - asteroid.radius < 0 || asteroid.x + asteroid.radius > window.innerWidth) {
        asteroid.dx *= -1;
      }
      if (asteroid.y - asteroid.radius < 0 || asteroid.y + asteroid.radius > window.innerHeight) {
        asteroid.dy *= -1;
      }

      // Check collision with spaceship
      const dx = this.spaceship.x - asteroid.x;
      const dy = this.spaceship.y - asteroid.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.spaceship.radius + asteroid.radius) {
        this.gameOver = true;
        this.survivalTime = (Date.now() - this.gameStartTime) / 1000; // Convert to seconds
        if (this.spawnInterval) {
          clearInterval(this.spawnInterval);
        }
        // Remove game-active class when game is over
        this.canvasRef.nativeElement.classList.remove('game-active');
      }
    });

    // Check collisions between asteroids
    for (let i = 0; i < this.asteroids.length; i++) {
      for (let j = i + 1; j < this.asteroids.length; j++) {
        this.checkAsteroidCollision(this.asteroids[i], this.asteroids[j]);
      }
    }
  }

  private draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (!this.gameStarted) {
      return;  // Don't draw anything if game hasn't started
    }

    // Draw spaceship
    this.ctx.beginPath();
    this.ctx.arc(this.spaceship.x, this.spaceship.y, this.spaceship.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fill();
    this.ctx.closePath();

    // Draw asteroids
    this.asteroids.forEach(asteroid => {
      this.ctx.beginPath();
      this.ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fill();
      this.ctx.closePath();
    });

    // Draw game over message and restart button
    if (this.gameOver) {
      this.ctx.font = '48px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`Game Over! You survived ${this.survivalTime.toFixed(1)} seconds`, window.innerWidth / 2, window.innerHeight / 2 - 50);
    }
  }

  private gameLoop() {
    if (this.gameStarted && !this.gameOver) {
      this.updateAsteroids();
    }
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}
