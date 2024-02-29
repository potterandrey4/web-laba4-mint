import {AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {UserService} from "../../service/user.service";
import {Router, RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {Shot, ShotService} from "../../service/shot.service";
import {NgForOf} from "@angular/common";
import {
  cellCount,
  cellSize,
  centerX,
  centerY,
  graphBottom,
  graphLeft,
  graphRight,
  graphTop, lineWidth, padding,
  rMax,
  rMin,
  scale,
  yMax,
  yMin
} from "../../../environment/environment";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink, FormsModule, NgForOf],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements AfterViewInit, OnInit {
  private userService = inject(UserService)
  private shotService = inject(ShotService)
  form: any = {
    "x": "1",
    "y": "1",
    "r": "1"
  }
  protected shots: Shot[] = []
  private availableX: any = ["2", "1", "0", "-1", "-2"]
  private availableR: any = ["0.5", "1", "1.5", "2"]

  @ViewChild('graphCanvas') canvasRef!: ElementRef<HTMLCanvasElement>
  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  private messageService: MessageService = inject(MessageService);

  ngOnInit(): void {
    this.shotService.retrieveShots().subscribe((shots) => this.shots = shots)
    this.canvas = this.canvasRef.nativeElement
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.context.scale(scale, scale)
    this.updateGraph()
  }

  ngAfterViewInit(): void {
    this.shotService.retrieveShots().subscribe((shots) => this.shots = shots)
    console.log(this.shots)
    this.canvas = this.canvasRef.nativeElement
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.context.scale(scale, scale)
    this.updateGraph()
  }

  addPoint(x: number, y: number, inArea: boolean) {
    if (inArea) {
      this.context.fillStyle = "rgba(0, 140, 0.8)";
    } else {
      this.context.fillStyle = "rgba(140, 0, 0.8)";
    }
    this.context.beginPath();
    this.context.arc(centerX + x, centerY - y, 0.1, 0, Math.PI * 2);
    this.context.fill();
  }

  updateGraph() {
    console.log(this.form.r)
    let r = parseFloat(this.form.r)
    this.context.clearRect(graphLeft, graphTop, graphRight, graphBottom);
    if (r <= rMax && r >= rMin) {
      this.drawFigures(r);
      this.drawAxis();
      for (let shot of this.shots) {
        if (shot.r == r) {
          this.addPoint(shot.x, shot.y, shot.inArea)
        }
      }
    }
}

  drawFigures(r: number) {
    this.drawCircle(r);
    this.context.fillRect(centerX, centerY, r, r * 0.5);
    this.drawTriangle(r);
  }

  drawCircle(r: number) {
    this.context.fillStyle = "#8D8948";
    this.context.beginPath();
    this.context.arc(centerX, centerY, r / 2, 0, Math.PI * 2);
    this.context.fill();
    this.context.clearRect(centerX, centerY, -r, -r);
    this.context.clearRect(centerX, centerY, r, r);
    this.context.clearRect(centerX, centerY, r, -r);
  }

  drawTriangle(r: number) {
    this.context.fillStyle = "#8D8948";
    this.context.beginPath();
    this.context.moveTo(centerX, centerY);
    this.context.lineTo(centerX, centerY - r/2);
    this.context.lineTo(centerX - r, centerY);
    this.context.fill();
  }



drawAxis() {
    this.context.fillStyle = "#E97C7C";
    this.context.lineWidth = lineWidth;
    this.context.beginPath();
    this.context.moveTo(graphLeft, centerY);
    this.context.lineTo(graphRight, centerY);
    this.context.stroke();
    
    const xstep = (graphRight - graphLeft) / cellCount;
    
    for (let i = 0; i <= cellCount; i++) {
        this.context.beginPath();
        this.context.moveTo(graphLeft + i * xstep, graphTop - padding);
        this.context.lineTo(graphLeft + i * xstep, graphBottom);
        this.context.stroke();
    }

    this.context.moveTo(centerX, graphTop);
    this.context.lineTo(centerX, graphBottom);
    this.context.stroke();

    const ystep = (graphBottom - graphTop) / cellCount;

    for (let i = 0; i <= cellCount; i++) {
        this.context.beginPath();
        this.context.moveTo(graphLeft - padding, graphTop + i * ystep);
        this.context.lineTo(graphRight, graphTop + i * ystep);
        this.context.stroke();
    }
}


  onSubmit() {
    let {x, y, r} = this.form
    y = y.replace(",", ".")
    if (this.availableX.includes(x) && this.availableR.includes(r) &&
      parseFloat(y) > yMin && parseFloat(y) < yMax &&
      /^-?\d*([.,]{1}\d*)?$/.test(y)) {
      this.shotService.createShot(
        parseFloat(x),
        parseFloat(y),
        parseFloat(r)
      ).subscribe((shot) => {
        this.shots = this.shots.concat(shot)
        this.updateGraph()
      })
    } else {
      this.showError("Некорретные данные в форме!")
    }
  }

  onClick(event: MouseEvent) {
    let x = -5 + event.offsetX / 25;
    let xS = x.toFixed(6);
    let y = 5 - event.offsetY / 25;
    let yS = y.toFixed(6);
    this.shotService.createShot(xS, yS, this.form.r).subscribe((shot) => {
      this.shots = this.shots.concat(shot)
      this.updateGraph()
    })
  }

  logout() {
    this.userService.logout()
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    })
  }
}
