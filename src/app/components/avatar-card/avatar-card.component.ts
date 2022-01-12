import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Capsule, HumanoidDescriptionNode } from 'game-capsule';
import { FileService } from 'pixowor-core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, of } from 'rxjs';
import { WEB_RESOURCE_URI } from 'src/app/app.module';
import { AppService } from 'src/app/app.service';
import { AvatarModel } from 'src/app/models/avatar.model';
// import { HumanoidCard } from 'src/app/app.service';
import { AvatarAssetsUploadComponent } from '../avatar-assets-upload/avatar-assets-upload.component';
const urlResolve = require('url-resolve-browser');

@Component({
  selector: 'avatar-card',
  templateUrl: './avatar-card.component.html',
  styleUrls: ['./avatar-card.component.scss'],
  providers: [DialogService],
})
export class AvatarCardComponent implements AfterViewInit, OnDestroy {
  @Input() avatar: AvatarModel;

  @Output() onDressup = new EventEmitter();

  avatarCover$: Observable<string>;

  private imgObjectUrl: string;

  constructor(
    public dialogService: DialogService,
    public appService: AppService,
    public fileService: FileService,
    public sanitizer: DomSanitizer,
    public messageService: MessageService,
    public zone: NgZone,
    @Inject(WEB_RESOURCE_URI) private webResourceUri: string
  ) {}

  get avatarCoverUrl() {
    return urlResolve(this.webResourceUri, this.avatar.cover);
  }

  get avatarConfigFileUrl() {
    return new URL(
      `avatar/${this.avatar._id}/${this.avatar.version}/${this.avatar._id}.pi`,
      this.webResourceUri
    ).toString();
  }

  async ngAfterViewInit() {
    console.log('avatar: ', this.avatar);

    this.imgObjectUrl = await this.fileService.getImageUrl(this.avatarCoverUrl);

    const safeImgUrl: any = this.sanitizer.bypassSecurityTrustUrl(
      this.imgObjectUrl
    );

    this.avatarCover$ = of(safeImgUrl);
  }

  tryDressup(): void {
    this.fileService
      .getFileArrayBuffer(this.avatarConfigFileUrl)
      .then((buffer) => {
        const message = HumanoidDescriptionNode.decode(new Uint8Array(buffer));
        const capsule = new Capsule();
        const humanoidDescNode = new HumanoidDescriptionNode(capsule);
        humanoidDescNode.deserialize(message);
        this.onDressup.emit(humanoidDescNode.slots);
      });
  }

  editAvatar(): void {
    this.fileService
      .getFileArrayBuffer(this.avatarConfigFileUrl)
      .then((buffer) => {
        const message = HumanoidDescriptionNode.decode(new Uint8Array(buffer));
        const capsule = new Capsule();
        const humanoidDescNode = new HumanoidDescriptionNode(capsule);
        humanoidDescNode.deserialize(message);

        const dialogRef = this.dialogService.open(AvatarAssetsUploadComponent, {
          header: 'Edit Avatar',
          width: '920px',
          data: {
            humanoidDescNode,
          },
        });

        dialogRef.onClose.subscribe((data) => {
          if (data == true) {
            this.appService.refreshTrigger$.next(true);
            this.messageService.add({
              severity: 'success',
              detail: 'Sava and upload success!',
            });
          }
        });
      })
      .catch((err) => {
        this.messageService.add({ severity: 'error', detail: err.message });
      });
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.imgObjectUrl);
  }
}
