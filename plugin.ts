import { Plugin, PixoworCore, UIEvents } from 'pixowor-core';
import manifest from './manifest.json';

export class PixoworAvatarManagePlugin extends Plugin {
  constructor(pixoworCore: PixoworCore) {
    super(pixoworCore, manifest);
  }

  activate(): void {
    this.colorLog(`${this.name} activate, Pid: ${this.pid}`);

    this.pixoworCore.workspace.emit(UIEvents.INJECT_PLUGIN_MENU, {
      pid: this.pid,
      label: 'Avatar Manage',
      type: 'subwindow',
      width: 1320,
      height: 860
    });
  }

  deactivate(): void {}
}
