import { Avatar, Owner, AvatarVisibility } from 'pixow-api';

export class AvatarModel implements Avatar {
  _id: string;
  owner: Owner;
  tags: string[];
  name: string;
  description: string;
  visibility: AvatarVisibility;
  createdAt: Date;
  updatedAt: Date;
  parts: string[];
  archive: boolean;
  type: string;
  version?: number;
  avatar_slot?: string;
  cover: string;

  constructor(data: Avatar) {
    this._id = data._id;
    this.owner = data.owner || {
      _id: '',
      nickname: '已注销',
      username: '已注销',
    };
    this.tags = data.tags;
    this.name = data.name;
    this.description = data.description;
    this.visibility = data.visibility;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.parts = data.parts;
    this.archive = data.archive;
    this.type = data.type;
    this.version = data.version;
    this.avatar_slot = data.avatar_slot;

    this.cover = data.version
      ? `avatar/part/${this._id}/${this.version}/thumbnail.png`
      : `avatar/part/${this._id}/stand.png`;
  }
}
