import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';

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
  styleUrls: ['./app.component.scss']
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
  private gameOver = false;

  ngOnInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size to match window size
    this.resizeCanvas();
    
    // Initialize asteroids
    this.initializeAsteroids();
    
    // Start game loop
    this.gameLoop();
  }

  @HostListener('window:resize')
  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.spaceship.x = event.clientX;
    this.spaceship.y = event.clientY;
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

  private updateAsteroids() {
    this.asteroids.forEach(asteroid => {
      // Update position
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
      }
    });
  }

  private draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

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

    // Draw game over message
    if (this.gameOver) {
      this.ctx.font = '48px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  private gameLoop() {
    if (!this.gameOver) {
      this.updateAsteroids();
    }
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}
