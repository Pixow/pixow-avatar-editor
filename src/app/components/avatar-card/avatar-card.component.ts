import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  Output,
} from '@angular/core';
import { ImageService } from 'pixowor-core';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, of } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AvatarModel } from 'src/app/models/avatar.model';
// import { HumanoidCard } from 'src/app/app.service';
import { AvatarAssetsUploadComponent } from '../avatar-assets-upload/avatar-assets-upload.component';
const urlResolve = require('url-resolve-browser');

@Component({
  selector: 'avatar-card',
  templateUrl: './avatar-card.component.html',
  styleUrls: ['./avatar-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class AvatarCardComponent implements AfterViewInit {
  @Input() avatar: AvatarModel;

  @Output() onDressup = new EventEmitter();

  avatarCover$: Observable<string>;

  constructor(
    public dialogService: DialogService,
    public appService: AppService,
    public imageService: ImageService,
    public zone: NgZone
  ) {}

  async ngAfterViewInit() {
    this.avatarCover$ = of(
      await this.imageService.getImage(
        `https://osd-alpha.tooqing.com/${this.avatar.cover}`
      )
    );
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
}
