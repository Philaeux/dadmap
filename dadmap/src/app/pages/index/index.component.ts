import { Component, ElementRef, HostListener, ViewChild } from '@angular/core'
import { ClipboardModule, Clipboard } from '@angular/cdk/clipboard'

import { CommonModule } from '@angular/common'
import { Map, MapInfo } from '../../models'
import { Crypt_01 } from '../../maps/Crypt_01'
import { Crypt_02 } from '../../maps/Crypt_02'
import { GoblinCave_01 } from '../../maps/GoblinCave_01'
import { IceAbyss_01 } from '../../maps/IceAbyss_01'
import { IceCave_01 } from '../../maps/IceCave_01'
import { Inferno_01 } from '../../maps/Inferno_01'
import { Inferno_02 } from '../../maps/Inferno_02'


@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, ClipboardModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {

  // Link to the canvas
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement> | undefined
  // Context to run draw commands
  context: CanvasRenderingContext2D | null = null;
  // Offset of the draw on the X
  offsetX: number = 960;
  // Offset of the draw on the Y
  offsetY: number = -20;
  // Background color to apply on the context
  backgroundColor: string = '#1E1C18';
  // Current scale applied to the drawing
  scale: number = 0.45;
  // How much scale to apply with every scroll
  scaleSpeed: number = 1.1;
  // Mouse X position
  mouseX: number = 0
  // Mouse Y position
  mouseY: number = 0

  // Starting point of a drag
  dragStart: MouseEvent | null = null
  // Drag speed
  dragSpeed: number = 0.8

  // Image Bank
  imageBank: {
    [key: string]: HTMLImageElement
  } = {}

  // Selected map
  selectedMap: string = "Crypt_01"
  // All map info
  maps: MapInfo = {
    "Crypt_01": Crypt_01,
    "Crypt_02": Crypt_02,
    "Inferno_01": Inferno_01,
    "Inferno_02": Inferno_02,
    "GoblinCave_01": GoblinCave_01,
    "IceCave_01": IceCave_01,
    "IceAbyss_01": IceAbyss_01,
  }
  // Flag to display cursor coordinates
  displayCoordinates: boolean = false
  displayFlags = {
    "shrine_health": true,
    "shrine_health_or_respawn": true,
    "shrine_respawn": true,
    "spawn": true,
  }

  constructor(private clipboard: Clipboard) { }

  ngOnInit() {
    this.context = this.canvas!.nativeElement.getContext('2d')!

    this.loadImages()
  }

  loadImages() {
    for (const mapName in this.maps) {
      this.loadImage(mapName, ".webp")
    }
    for (const iconName in this.displayFlags) {
      this.loadImage(iconName, ".png")
    }
  }

  loadImage(iconName: string, ext: string) {
    this.imageBank[iconName] = new Image()
    this.imageBank[iconName].src = iconName + ext
    this.imageBank[iconName].onload = () => {
      this.draw()
    }
  }

  draw() {
    if (this.context == null || this.canvas == null) {
      return
    }

    // Clear
    const canvasEl = this.canvas.nativeElement
    this.context.clearRect(0, 0, canvasEl.width, canvasEl.height)

    // Set the background color
    this.context.fillStyle = this.backgroundColor
    this.context.fillRect(0, 0, canvasEl.width, canvasEl.height)

    // Apply scaling
    this.context.save()
    this.context.scale(this.scale, this.scale)

    // Draw map
    const img = new Image()
    img.src = this.imageBank[this.selectedMap].src
    this.context!.drawImage(img, this.offsetX, this.offsetY, img.width, img.height)

    // Restore
    this.context.restore()

    // Draw Elements
    for (const category of Object.keys(this.maps[this.selectedMap]) as (keyof Map)[]) {
      if (category == "name" || category == "module" || category == "shrine_armor" || category == "shrine_power" || category == "shrine_speed" || category == "herb" || category == "ore") continue
      if (!this.displayFlags[category]) continue

      for (let spawn of this.maps[this.selectedMap][category]) {
        const img = new Image()
        img.src = this.imageBank[category].src
        this.context.drawImage(img, (spawn.x + this.offsetX) * this.scale - img.width / 2, (spawn.y + this.offsetY) * this.scale - img.height)
      }
    }

    // Draw coordinates
    if (this.displayCoordinates) {
      let realX = this.mouseX / this.scale - this.offsetX
      let realY = this.mouseY / this.scale - this.offsetY

      this.drawStroked(`${realX.toFixed(1)} | ${realY.toFixed(1)}`,
        this.mouseX + 10, this.mouseY + 10)
    }
  }

  drawStroked(text: string, x: number, y: number) {
    if (this.context == null) return

    this.context.font = '48px Sans-serif'
    this.context.strokeStyle = 'black'
    this.context.lineWidth = 8
    this.context.strokeText(text, x, y)
    this.context.fillStyle = 'white'
    this.context.fillText(text, x, y)
  }

  startDrag(event: MouseEvent) {
    this.dragStart = event
    if (event.button == 1) {
      let realX = this.mouseX / this.scale - this.offsetX
      let realY = this.mouseY / this.scale - this.offsetY

      this.clipboard.copy(`{ x: ${realX.toFixed(0)},\n y: ${realY.toFixed(0)} },`)
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.canvas == null) return

    const rect = this.canvas.nativeElement.getBoundingClientRect()
    this.mouseX = event.clientX - rect.left
    this.mouseY = event.clientY - rect.top

    if (this.dragStart != null) {
      this.offsetX += (event.clientX - this.dragStart.clientX) / this.scale * this.dragSpeed
      this.offsetY += (event.clientY - this.dragStart.clientY) / this.scale * this.dragSpeed
      this.dragStart = event
    }
    if (this.dragStart != null || this.displayCoordinates) {
      this.draw()
    }
  }

  endDrag() {
    this.dragStart = null
  }

  onScroll(event: WheelEvent) {
    event.preventDefault()

    const zoomIn = event.deltaY < 0
    const zoomOut = event.deltaY > 0

    let posX = event.clientX / this.scale - this.offsetX
    let posY = event.clientY / this.scale - this.offsetY

    if (zoomIn) {
      this.scale *= this.scaleSpeed
    } else if (zoomOut) {
      this.scale /= this.scaleSpeed
    }

    let newPosX = event.clientX / this.scale - this.offsetX
    let newPosY = event.clientY / this.scale - this.offsetY

    this.offsetX += (newPosX - posX)
    this.offsetY += (newPosY - posY)

    this.draw()
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (["P", "p"].includes(event.key)) {
      this.displayCoordinates = !this.displayCoordinates
    } else if (["S", "s"].includes(event.key)) {
      this.displayFlags["spawn"] = !this.displayFlags["spawn"]
    } else if (["R", "r"].includes(event.key)) {
      this.displayFlags["shrine_respawn"] = !this.displayFlags["shrine_respawn"]
    } else if (["&", "1"].includes(event.key)) {
      // Load crypt or variant
      if (this.selectedMap == "Crypt_01") {
        this.selectedMap = "Crypt_02"
      } else {
        this.selectedMap = "Crypt_01"
      }
      this.offsetX = 960
      this.offsetY = -20
      this.scale = 0.45
    } else if (["é", "2"].includes(event.key)) {
      // Load inferno or variant
      if (this.selectedMap == "Inferno_01") {
        this.selectedMap = "Inferno_02"
      } else {
        this.selectedMap = "Inferno_01"
      }
      this.offsetX = 600
      this.offsetY = 50
      this.scale = 0.8
    } else if (["\"", "3"].includes(event.key)) {
      // Load goblin
      this.selectedMap = "GoblinCave_01"
      this.offsetX = 960
      this.offsetY = -20
      this.scale = 0.45
    } else if (["(", "5"].includes(event.key)) {
      // Load ice
      this.selectedMap = "IceCave_01"
      this.offsetX = 960
      this.offsetY = -20
      this.scale = 0.45
    } else if (["-", "6"].includes(event.key)) {
      // Load Abyss
      this.selectedMap = "IceAbyss_01"
      this.offsetX = 600
      this.offsetY = 50
      this.scale = 0.8
    }

    this.draw()
  }
}
