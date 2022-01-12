import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HumanoidSlot } from '@PixelPai/game-core/structure';
// import { HumanoidDescriptionNode } from 'game-capsule';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { AvatarPreviewComponent } from '../avatar-preview/avatar-preview.component';
import { MessageService } from 'primeng/api';
import { SlotConfig, SlotConfigs } from 'src/app/models/slot.model';
import { HumanoidDescriptionNode } from 'game-capsule';
import { WEB_RESOURCE_URI } from 'src/app/app.module';
import {
  FileService,
  CloudStorageService,
  UploadFileConfig,
} from 'pixowor-core';
import PixowApi from 'pixow-api';
import { base64toBlob, blobToBase64 } from 'src/app/utils';
const urlResolve = require('url-resolve-browser');

export enum AvatarDir {
  FRONT = 3,
  BACK = 1,
}

@Component({
  selector: 'avatar-assets-upload',
  templateUrl: './avatar-assets-upload.component.html',
  styleUrls: ['./avatar-assets-upload.component.scss'],
  providers: [MessageService],
})
export class AvatarAssetsUploadComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(AvatarPreviewComponent) avatarPreview!: AvatarPreviewComponent;
  @ViewChild('myTooltip', { static: false }) myTooltip;

  isFront = true;

  humanoidDescNode: HumanoidDescriptionNode;

  readySubscription: Subscription = null;

  slotConfigs: SlotConfig[];

  nextVersion: number;

  public get frontSlotConfigs(): SlotConfig[] {
    return this.slotConfigs.filter((config) => config.isFront);
  }

  public get backSlotConfigs(): SlotConfig[] {
    return this.slotConfigs.filter((config) => !config.isFront);
  }

  constructor(
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    public cd: ChangeDetectorRef,
    private pixowApi: PixowApi,
    private fileService: FileService,
    private cloudStorageService: CloudStorageService,
    @Inject(WEB_RESOURCE_URI) private webResourceUri: string
  ) {
    const { humanoidDescNode } = this.config.data;
    this.humanoidDescNode = humanoidDescNode;
  }

  async ngOnInit() {
    await this.initSlotConfigs();
  }

  ngAfterViewInit(): void {
    // 必须等待avatarPreview龙骨加载完成
    this.readySubscription = this.avatarPreview.ready$
      .asObservable()
      .subscribe((ready) => {
        if (ready) {
          this.previewHumanoidSlots();
        }
      });
  }

  private getSlotAssetKey(sn: string, version: string, slotName: string) {
    return `avatar/${sn}/${version}/${slotName}.png`;
  }

  private initSlotConfigs(): Promise<any> {
    // Generate slotConfigs with humanoidDescNode default slots
    const slotConfigs = this.generateSlotConfigsWithHumanoidDefauleSlots();

    const tasks: Promise<any>[] = [];

    for (const slot of this.humanoidDescNode.slots) {
      const slotConfig = slotConfigs.find(
        (config) => config.slotName === slot.slot
      );

      const slotAssetKey = this.getSlotAssetKey(
        slot.sn,
        slot.version,
        slot.slot
      );

      const slotAssetUrl = urlResolve(this.webResourceUri, slotAssetKey);

      tasks.push(this.loadSlotAsset(slotAssetUrl, slotConfig));
    }

    return Promise.all(tasks).then(() => {
      this.slotConfigs = slotConfigs;
    });
  }

  private generateSlotConfigsWithHumanoidDefauleSlots(): SlotConfig[] {
    const newSlotConfigs = JSON.parse(JSON.stringify(SlotConfigs));
    for (const config of newSlotConfigs) {
      const slot = this.humanoidDescNode.slots.find(
        (item) => item.slot === config.slotName
      );
      if (slot) {
        config.version = slot.version;
        config.sn = slot.sn;
        config.emptyOverride = slot.emptyOverride;
        config.removeBase = slot.removeBase;
      }
    }

    return newSlotConfigs;
  }

  private async loadSlotAsset(
    url: string,
    config: SlotConfig
  ): Promise<SlotConfig> {
    const blob = await this.fileService.getFileBlob(url);
    config.imageBlob = blob;
    return config;
  }

  public previewHumanoidSlots() {
    const humanoidSlots: HumanoidSlot[] = this.humanoidDescNode.slots.map(
      (slot) => {
        return {
          slot: slot.slot,
          version: slot.version,
          sn: slot.sn,
          emptyOverride: slot.emptyOverride,
          removeBase: slot.removeBase,
        };
      }
    );

    this.dressup(humanoidSlots);
  }

  public turnAroundHumanoidSlots(): void {
    this.isFront = !this.isFront;
  }

  public dressup(slots: HumanoidSlot[]): void {
    this.avatarPreview.dressup(slots);
  }

  private getSlotConfig(slotName: string): SlotConfig {
    return this.slotConfigs.find((item) => item.slotName === slotName);
  }

  public handleSelectSlotAsset(event): void {
    const { slotName, imageBlob } = event;

    const slotConfig = this.getSlotConfig(slotName);
    slotConfig.imageBlob = imageBlob;

    // preview avatar with slot
    blobToBase64(imageBlob).then((imgData) => {
      const humanoidSlot: HumanoidSlot = {
        slot: slotConfig.slotName,
        version: slotConfig.version,
        sn: slotConfig.sn,
        imgDataBase64: imgData as string,
      };
      this.dressup([humanoidSlot]);
    });
  }

  handleTakeoffSlot(event): void {
    const { slotName } = event;

    const slotConfig = this.getSlotConfig(slotName);
    slotConfig.imageBlob = null;

    this.avatarPreview.canvas.cancelSlots([slotName]);
  }

  handleEmptyOverride(event): void {
    const { slotName, emptyOverride } = event;

    const slotConfig = this.getSlotConfig(slotName);
    slotConfig.emptyOverride = emptyOverride;
  }

  handleRemoveBase(event): void {
    const { slotName, removeBase } = event;

    const slotConfig = this.getSlotConfig(slotName);
    slotConfig.removeBase = removeBase;
  }

  public saveAndUpload(): void {
    // 1. 保存数据到平台
    this.saveToDB()
      .then((humanoid) => {
        // 2. 序列化humanoid文件并上传
        return this.serializeAndUploadHumanoid();
      })
      .then(() => {
        // 3. 上传Humanoid图片资源
        return this.uploadSlotAssets();
      })
      .then(() => {
        // 4. 上传封面图
        return this.generateAvatarThumbnailAndUpload();
      })
      .then(() => {
        this.messageService.add({
          key: 'tc',
          severity: 'success',
          detail: 'Sava and upload success!',
        });
      });
  }

  // 平台数据接口
  // 1. 更新Avatar
  // 2. 创建Avatar
  private saveToDB(): Promise<any> {
    if (this.humanoidDescNode.sn) {
      this.nextVersion = +this.humanoidDescNode.version + 1;
      return new Promise((resolve, reject) => {
        this.pixowApi
          .updateAvatar({
            id: this.humanoidDescNode.sn,
            name: this.humanoidDescNode.name,
            version: this.nextVersion,
          })
          .then((res) => {
            this.humanoidDescNode.version = this.nextVersion.toString();
            resolve(this.humanoidDescNode);
          })
          .catch((err) => reject(err));
      });
    } else {
      return new Promise((resolve, reject) => {
        this.pixowApi
          .createAvatar({
            name: this.humanoidDescNode.name,
            version: 1,
            type: 'other', // TODO: dont need this type
          })
          .then((res) => {
            this.humanoidDescNode.sn = res.data._id;
            this.humanoidDescNode.version = '1';
            resolve(this.humanoidDescNode);
          })
          .catch((err) => reject(err));
      });
    }
  }

  // 序列化配置文件并上传
  private serializeAndUploadHumanoid(): Promise<any> {
    // generate humanoidDescNode slots from slotConfigs

    this.humanoidDescNode.slots = this.slotConfigs
      .filter((slotConfig) => {
        if (
          slotConfig.imageBlob ||
          !!slotConfig.removeBase ||
          !!slotConfig.emptyOverride
        ) {
          return true;
        } else {
          return false;
        }
      })
      .map((slotConfig) => {
        // 新建的avatar
        if (slotConfig.imageBlob) {
          slotConfig.sn = this.humanoidDescNode.sn;
          slotConfig.version = this.humanoidDescNode.version;

          return {
            slot: slotConfig.slotName,
            version: this.humanoidDescNode.version,
            sn: this.humanoidDescNode.sn,
            emptyOverride: slotConfig.emptyOverride,
            ...(slotConfig.removeBase && { removeBase: slotConfig.removeBase }),
          };
        } else {
          // 更新的avatar
          return {
            slot: slotConfig.slotName,
            version: this.humanoidDescNode.version,
            emptyOverride: slotConfig.emptyOverride,
            ...(slotConfig.removeBase && { removeBase: slotConfig.removeBase }),
          };
        }
      });

    const buff = this.humanoidDescNode.serialize();

    const blob = new Blob([buff]);
    const key = `avatar/${this.humanoidDescNode.sn}/${this.humanoidDescNode.version}/${this.humanoidDescNode.sn}.pi`;
    const file = new File([blob], key);

    return this.cloudStorageService.uploadFile({
      file,
      key,
    });
  }

  // 上传所有槽位资源
  private uploadSlotAssets(): Promise<any> {
    const tasks: Promise<any>[] = [];
    const uploadFileConfigs: UploadFileConfig[] = this.slotConfigs
      .filter((config) => config.imageBlob)
      .map((config) => {
        const key = `avatar/${config.sn}/${config.version}/${config.slotName}.png`;
        const file = new File([config.imageBlob], key);
        return {
          file,
          key,
        };
      });
    uploadFileConfigs.forEach((config) => {
      tasks.push(this.cloudStorageService.uploadFile(config));
    });
    return Promise.all(tasks);
  }

  // 生成封面图，并上传
  public generateAvatarThumbnailAndUpload(): Promise<any> {
    return this.avatarPreview.canvas.generateThumbnail().then((imageData) => {
      const key = `avatar/${this.humanoidDescNode.sn}/${this.humanoidDescNode.version}/thumbnail.png`;

      const thumbnailUploadFileConfig = {
        key,
        file: new File([base64toBlob(imageData)], key),
      };

      return this.cloudStorageService.uploadFile(thumbnailUploadFileConfig);
    });
  }

  ngOnDestroy(): void {
    this.readySubscription.unsubscribe();
  }
}
