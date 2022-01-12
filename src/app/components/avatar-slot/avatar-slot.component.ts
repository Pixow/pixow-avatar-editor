import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { SlotConfig } from 'src/app/models/slot.model';
import { readFileAsBlob } from 'src/app/utils';
const imageToBlob = require('image-to-blob');

@Component({
  selector: 'avatar-slot',
  templateUrl: './avatar-slot.component.html',
  styleUrls: ['./avatar-slot.component.scss'],
})
export class AvatarSlotComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input() slotConfig: SlotConfig;

  // Emit when select a image
  @Output() onAssetSelect = new EventEmitter();
  // Emit when remove a image
  @Output() onRemove = new EventEmitter();
  @Output() onEmptyOverride = new EventEmitter();
  @Output() onRemoveBase = new EventEmitter();

  @ViewChild('humanoidSlot') humanoidSlot: ElementRef;
  @ViewChild('slotPreview') slotPreview: ElementRef;

  canvas;
  // selectedFile: File;
  hasAssets = false;

  assetUrl: string;

  constructor() {}

  ngOnInit(): void {
    if (this.slotConfig.imageBlob) {
      this.hasAssets = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['slotConfig'].currentValue.imageBlob) {
      this.hasAssets = true;
    }
  }

  ngAfterViewInit(): void {
    this.setPosition();
    this.showSlotAsset();
  }

  // 设置装扮槽位位置
  setPosition(): void {
    this.humanoidSlot.nativeElement.style.setProperty(
      'top',
      `${this.slotConfig.top}px`
    );
    this.humanoidSlot.nativeElement.style.setProperty(
      'left',
      `${this.slotConfig.left}px`
    );
  }

  showSlotAsset(): void {
    if (this.slotConfig.imageBlob) {
      this.assetUrl = window.URL.createObjectURL(this.slotConfig.imageBlob);
      this.slotPreview.nativeElement.src = this.assetUrl;
    }
  }

  public hasRemoveBase(): boolean {
    return this.slotConfig.hasOwnProperty('removeBase');
  }

  public isEmptyOverride(): boolean {
    return !!this.slotConfig.emptyOverride;
  }

  public isRemoveBase(): boolean {
    return !!this.slotConfig.removeBase;
  }

  selectFile(event): void {
    const { currentFiles } = event;

    if (currentFiles.length > 0) {
      const selectedFile = currentFiles[0];
      this.hasAssets = true;

      readFileAsBlob(selectedFile).then((blob) => {
        this.onAssetSelect.emit({
          slotName: this.slotConfig.slotName,
          imageBlob: blob,
        });

        this.assetUrl = window.URL.createObjectURL(blob);
        this.slotPreview.nativeElement.src = this.assetUrl;
      });
    }
  }

  // Override this slot will has no effect
  toggleEmptyOverride(): void {
    if (this.slotConfig.hasOwnProperty('emptyOverride')) {
      this.slotConfig.emptyOverride = !!!this.slotConfig.emptyOverride;
      this.onEmptyOverride.emit({
        slotName: this.slotConfig.slotName,
        emptyOverride: this.slotConfig.emptyOverride,
      });
    }
  }

  // Remove this slot base when dress this slot cost
  toggleRemoveBase(): void {
    if (this.slotConfig.hasOwnProperty('removeBase')) {
      this.slotConfig.removeBase = !!!this.slotConfig.removeBase;
      this.onRemoveBase.emit({
        slotName: this.slotConfig.slotName,
        removeBase: this.slotConfig.removeBase,
      });
    }
  }

  takeoffSlot(): void {
    this.hasAssets = false;

    this.onRemove.emit({
      slotName: this.slotConfig.slotName,
    });
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.assetUrl);
  }
}
