import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { SlotConfig } from 'src/app/models/slot.model';
const imageToBlob = require('image-to-blob');

@Component({
  selector: 'avatar-slot',
  templateUrl: './avatar-slot.component.html',
  styleUrls: ['./avatar-slot.component.scss'],
})
export class AvatarSlotComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() slotConfig: SlotConfig;

  // Emit when select a image
  @Output() onAssetSelect = new EventEmitter();
  // Emit when remove a image
  @Output() onRemove = new EventEmitter();
  @Output() onEmptyOverride = new EventEmitter();
  @Output() onRemoveBase = new EventEmitter();

  canvas;
  // selectedFile: File;
  hasAssets = false;

  @ViewChild('humanoidSlot') humanoidSlot: ElementRef;
  @ViewChild('slotPreview') slotPreview: ElementRef;

  constructor() {}

  ngOnInit(): void {
    console.log(`SlotConfig: ${this.slotConfig.slotName}`, this.slotConfig);
    if (this.slotConfig.imageBlob) {
      this.hasAssets = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes: ', changes);
    if (changes['slotConfig'].currentValue.imageBlob) {
      this.hasAssets = true;
    }
  }

  ngAfterViewInit(): void {
    this.setPosition();
    this.setSlotPreview();
  }

  setSlotPreview(): void {
    if (this.slotConfig.imageBlob) {
      const src = window.URL.createObjectURL(this.slotConfig.imageBlob);
      this.slotPreview.nativeElement.src = src;
    }
  }

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
    console.log(event);
    const { currentFiles } = event;

    if (currentFiles.length > 0) {
      const selectedFile = currentFiles[0];
      this.hasAssets = true;

      imageToBlob(selectedFile.path, (err, blob) => {
        if (err) {
          console.error(err);
          return;
        }

        this.onAssetSelect.emit({
          slotName: this.slotConfig.slotName,
          imageBlob: blob,
        });

        const src = window.URL.createObjectURL(blob);
        this.slotPreview.nativeElement.src = src;
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
}
