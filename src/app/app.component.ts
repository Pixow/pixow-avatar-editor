import {
  AfterViewInit,
  Component,
  ComponentRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HumanoidSlot } from '@PixelPai/game-core/structure';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AvatarPreviewComponent } from 'src/app/components/avatar-preview/avatar-preview.component';
import { Capsule, HumanoidDescriptionNode } from 'game-capsule';
import { AvatarAssetsUploadComponent } from 'src/app/components/avatar-assets-upload/avatar-assets-upload.component';
import {
  BehaviorSubject,
  Observable,
  Subject,
  debounceTime,
  catchError,
  of,
} from 'rxjs';
import { map, switchMap, timeout } from 'rxjs/operators';
import { AvatarModel } from './models/avatar.model';
import { AppService, GetAvatarsResponse } from './app.service';
import { SearchAvatarsParams } from 'pixow-api';

interface SortOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DialogService],
})
export class AppComponent implements OnInit {
  loadLangSuccess = false;

  keyword = '';
  page = 1;
  pageSize = 25;

  queries$ = new BehaviorSubject<SearchAvatarsParams>({
    keyword: this.keyword,
    page: this.page,
    pageSize: this.pageSize,
  });

  total = 0;
  avatarsResponse$: Observable<GetAvatarsResponse>;
  sortOptions: SortOption[] = [
    { name: 'Created Date(recent to past)', value: '-createdAt' },
    { name: 'Created Date(past to recent)', value: 'createdAt' },
  ];
  selectedSortOption: SortOption;

  first = 0; // Every search list first item sequence

  categories: MenuItem[];

  type: string; // avatar type

  @ViewChild(AvatarPreviewComponent) avatarPreview: AvatarPreviewComponent;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private dialog: DialogService
  ) {
    this.translate.setDefaultLang('zh-CN');
    this.translate.use('zh-CN').subscribe((data) => {
      this.loadLangSuccess = true;
    });
  }

  ngOnInit(): void {
    this.setupDataListenners();
    this.initCategories();
  }

  private setupDataListenners() {
    this.avatarsResponse$ = this.queries$.pipe(
      map((query: SearchAvatarsParams) => {
        console.log(query);
        query.keyword = query.keyword ? query.keyword.trim() : '';
        return query;
      }),
      debounceTime(500),
      switchMap((query: SearchAvatarsParams) =>
        this.appService.getAvatars(query)
      )
    );
  }

  private initCategories() {
    this.categories = [
      {
        label: 'Head',
        icon: 'pi pi-pw pi-filter',
        items: [
          {
            label: 'Base',
            icon: 'pi pi-fw pi-tags',
            command: () => {
              this.filterByType('base');
            },
          },
          { label: 'Face', icon: 'pi pi-fw pi-tags' },
          { label: 'Mask', icon: 'pi pi-fw pi-tags' },
        ],
      },
      {
        label: 'Body',
        icon: 'pi pi-fw pi-filter',
        items: [
          { label: 'Right Arm', icon: 'pi pi-fw pi-tags' },
          { label: 'Body', icon: 'pi pi-fw pi-tags' },
          { label: 'Dress', icon: 'pi pi-fw pi-tags' },
          { label: 'Left Arm', icon: 'pi pi-fw pi-tags' },
        ],
      },
      {
        label: 'Handheld',
        icon: 'pi pi-fw pi-filter',
        items: [
          {
            label: 'Weapons',
            icon: 'pi pi-pi pi-tags',
          },
          {
            label: 'Opisthenar',
            icon: 'pi pi-pi pi-tags',
          },
        ],
      },
      {
        label: 'Lower Body',
        icon: 'pi pi-fw pi-filter',
        items: [
          {
            label: 'Right Leg',
            icon: 'pi pi-fw pi-tags',
          },
          {
            label: 'Left Leg',
            icon: 'pi pi-fw pi-tags',
          },
        ],
      },
    ];
  }

  searchByKeyword() {
    this.page = 1;
    this.first = 0;

    this.loadData();
  }

  loadData(): void {
    this.queries$.next({
      page: this.page,
      pageSize: this.pageSize,
      keyword: this.keyword,
      ...(this.selectedSortOption && {
        sorts: [this.selectedSortOption.value],
      }),
      ...(this.type && {
        type: this.type,
      }),
    });
  }

  filterByType(value: string): void {
    this.type = value;
  }

  loadPage(event): void {
    const { page, first } = event;
    this.first = first;
    this.page = page + 1;

    this.loadData();
  }

  dressup(slots: HumanoidSlot[]): void {
    this.avatarPreview.clear();
    this.avatarPreview.dressup(slots);
  }

  public createAvatar(): void {
    // Use HumanoidDescriptionNode or AvatarNode

    const capsule = new Capsule();
    const humanoidDescNode = new HumanoidDescriptionNode(capsule);
    console.log('humanoidDescNode: ', humanoidDescNode);
    this.dialog.open(AvatarAssetsUploadComponent, {
      header: 'Create Avatar',
      width: '920px',
      data: {
        humanoidDescNode,
      },
    });
  }
}
