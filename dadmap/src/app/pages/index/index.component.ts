import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DraggableImage {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement> | undefined;
  context: CanvasRenderingContext2D | null = null;
  images: DraggableImage[] = [];
  draggingImage: DraggableImage | null = null;
  offsetX: number = 0;
  offsetY: number = 0;
  backgroundColor: string = '#1E1C18';
  scale: number = 1.0;
  scaleFactor: number = 1.1;
  mouseX: number = 0
  mouseY: number = 0

  ngOnInit() {
    this.context = this.canvas!.nativeElement.getContext('2d')!;
    this.loadImages();
  }

  loadImages() {
    const img1 = new Image();
    img1.src = 'crypt-01.webp';
    img1.onload = () => {
      this.images.push({ src: img1.src, x: 0, y: 0, width: img1.width, height: img1.height });
      this.draw();
    };
  }

  draw() {
    if (this.context == null || this.canvas == null) {
      return
    }

    // Clear
    const canvasEl = this.canvas.nativeElement;
    this.context.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // Set the background color
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, canvasEl.width, canvasEl.height);

    // Apply scaling
    this.context.save();
    this.context.scale(this.scale, this.scale);

    // Draw images
    this.images.forEach(img => {
      const image = new Image();
      image.src = img.src;
      this.context!.drawImage(image, img.x, img.y, img.width, img.height);
    });

    this.context.restore();

    // Draw position
    this.context.font = '16px Arial';
    this.context.fillStyle = 'white';
    this.context.fillText(`${this.mouseX * this.scale};${this.mouseY * this.scale}`, this.mouseX + 10, this.mouseY + 10);
  }

  startDrag(event: MouseEvent) {
    // TODO
  }

  onMouseMove(event: MouseEvent) {
    if (this.canvas == null) return

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.mouseX = event.clientX - rect.left;
    this.mouseY = event.clientY - rect.top;

    this.draw();
  }

  endDrag() {
    // TODO
  }

  onScroll(event: WheelEvent) {
    event.preventDefault();

    const zoomIn = event.deltaY < 0;
    const zoomOut = event.deltaY > 0;

    if (zoomIn) {
      this.scale *= this.scaleFactor;
    } else if (zoomOut) {
      this.scale /= this.scaleFactor;
    }

    this.draw();
  }
}
