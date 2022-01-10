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
import { ImageService } from 'pixowor-core';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, of } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AvatarModel } from 'src/app/models/avatar.model';
// import { HumanoidCard } from 'src/app/app.service';
import { AvatarAssetsUploadComponent } from '../avatar-assets-upload/avatar-assets-upload.component';

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
    public imageService: ImageService,
    public sanitizer: DomSanitizer,
    public zone: NgZone
  ) {}

  get avatarCoverUrl() {
    return `https://osd-alpha.tooqing.com/${this.avatar.cover}`;
  }

  async ngAfterViewInit() {
    this.imgObjectUrl = await this.imageService.getImage(this.avatarCoverUrl);

    const safeImgUrl: any = this.sanitizer.bypassSecurityTrustUrl(
      this.imgObjectUrl
    );

    this.avatarCover$ = of(safeImgUrl);
  }

  tryDressup(): void {
    // const humanoidFileUrl = urlResolve(
    //   this.pixoworCore.settings.WEB_RESOURCE_URI,
    //   `avatar/${this.humanoidCard._id}/${this.humanoidCard.version}/${this.humanoidCard._id}.humanoid`
    // );
    // fetch(humanoidFileUrl)
    //   .then((res) => res.arrayBuffer())
    //   .then((buffer) => {
    //     const message = HumanoidDescriptionNode.decode(new Uint8Array(buffer));
    //     const humanoidDescNode = new HumanoidDescriptionNode();
    //     humanoidDescNode.deserialize(message);
    //     console.log('humanoidDescNode: ', humanoidDescNode);
    //     this.onDressup.emit(humanoidDescNode.slots);
    //   });
  }

  editHumanoid(): void {
    // const humanoidFileUrl = urlResolve(
    //   this.pixoworCore.settings.WEB_RESOURCE_URI,
    //   `avatar/${this.humanoidCard._id}/${this.humanoidCard.version}/${this.humanoidCard._id}.humanoid`
    // );
    // fetch(humanoidFileUrl)
    //   .then((res) => res.arrayBuffer())
    //   .then((buffer) => {
    //     const message = HumanoidDescriptionNode.decode(new Uint8Array(buffer));
    //     const humanoidDescNode = new HumanoidDescriptionNode();
    //     humanoidDescNode.deserialize(message);
    //     console.log('humanoidDescNode: ', humanoidDescNode);
    //     const ref = this.dialogService.open(AvatarAssetsUploadComponent, {
    //       header: 'Edit Avatar',
    //       width: '70%',
    //       data: {
    //         humanoidDescNode,
    //       },
    //     });
    //   });
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.imgObjectUrl);
  }
}
