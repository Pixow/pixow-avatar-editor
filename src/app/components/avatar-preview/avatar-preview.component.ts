import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AvatarEditorCanvas,
  AvatarEditorEmitType,
  EditorCanvasManager,
  EditorCanvasType,
} from '@PixelPai/game-core/editor';
import { HumanoidSlot } from '@PixelPai/game-core/structure';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'avatar-preview',
  templateUrl: './avatar-preview.component.html',
  styleUrls: ['./avatar-preview.component.scss'],
})
export class AvatarPreviewComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Output() onTurnAround: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('avatarPreview', { static: false })
  avatarPreview: ElementRef;
  animationOptions;
  selectedAnimation = {};
  front = true;
  flipX = false;

  canvas: AvatarEditorCanvas;

  ready$ = new BehaviorSubject(false);

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.initAnimationOptions();
  }

  private initAnimationOptions() {
    this.animationOptions = [
      {
        label: this.translate.instant('AVATARPREVIEW.IDLE'),
        value: 'idle',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.WALK'),
        value: 'walk',
      },
      { label: this.translate.instant('AVATARPREVIEW.RUN'), value: 'run' },
      {
        label: this.translate.instant('AVATARPREVIEW.ATTACK'),
        value: 'attack',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.JUMP'),
        value: 'jump',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.INJURED'),
        value: 'injured',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.FALLDOWN'),
        value: 'failed',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.DANCE01'),
        value: 'dance01',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.DANCE02'),
        value: 'dance02',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.FISHING'),
        value: 'fishing',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.GREET'),
        value: 'greet01',
      },
      { label: this.translate.instant('AVATARPREVIEW.SIT'), value: 'sit' },
      { label: this.translate.instant('AVATARPREVIEW.LIE'), value: 'lie' },
      {
        label: this.translate.instant('AVATARPREVIEW.EMOTION01'),
        value: 'emotion01',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.SHOOTERIDLE'),
        value: 'shooteridle',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.SHOOTERWALK'),
        value: 'shooterwalk',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.SHOOTERRUN'),
        value: 'shooterrun',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.SHOOT'),
        value: 'shoot',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.BLOWUP'),
        value: 'blowup',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.EMOTION02'),
        value: 'emotion02',
      },
      {
        label: this.translate.instant('AVATARPREVIEW.MINING'),
        value: 'mining',
      },
    ];
  }

  ngAfterViewInit(): void {
    const element = this.avatarPreview.nativeElement;
    // const { WEB_RESOURCE_URI } = this.pixoworCore.settings;

    const id = 'avatarPreview_' + +new Date();
    element.setAttribute('id', id);

    this.canvas = EditorCanvasManager.CreateCanvas(EditorCanvasType.Avatar, {
      width: element.clientWidth,
      height: element.clientHeight,
      parent: id,
      // osdPath: WEB_RESOURCE_URI + '/',
      backgroundColor: '#f0f8ff',
      defaultSlots: [
        'head_face_3',
        'head_base_3',
        'barm_base_3',
        'body_cost_3',
        'body_base_3',
        'farm_base_3',
        'bleg_cost_3',
        'bleg_base_3',
        'fleg_cost_3',
        'fleg_base_3',
        'head_base_1',
        'farm_base_1',
        'body_cost_1',
        'body_base_1',
        'barm_base_1',
        'fleg_cost_1',
        'fleg_base_1',
        'bleg_cost_1',
        'bleg_base_1',
      ],
      defaultSN: '61615649255707001fbf3f77', // 默认装扮sn
      defaultVersion: '1', // 默认装扮version
      thumbnailWidth: 100, // 缩略图宽
      thumbnailHeight: 100, // 缩略图高
      thumbnailBottomArea: 10, // 缩略图下方留空
    }) as AvatarEditorCanvas;

    this.canvas.on(AvatarEditorEmitType.CanvasCreated, () => {
      this.ready$.next(true);
    });
  }

  public dressup(slots: HumanoidSlot[]): void {
    console.log('dressup canvas: ', this.canvas);
    this.canvas.mergeSlots(slots);
  }

  public takeoff(slotNames: string[]) {
    this.canvas.cancelSlots(slotNames);
  }

  public changeAnimation(event: any): void {
    const { value } = event.value;
    this.canvas.play(value);
  }

  public flip(): void {
    this.flipX = !this.flipX;
    this.canvas.toggleFlip(this.flipX);
  }

  public turnAround(): void {
    this.front = !this.front;
    this.canvas.toggleFacing(this.front);

    if (this.onTurnAround) {
      this.onTurnAround.emit();
    }
  }

  public reset(): void {
    this.canvas.clearSlots();
  }

  public clear() {
    this.canvas.clearSlots();
  }

  ngOnDestroy(): void {
    if (this.canvas) {
      this.canvas.destroy();
    }

    this.ready$.next(false);
    this.ready$.complete();
  }
}
