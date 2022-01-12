import {
  AfterViewInit,
  Component,
  ComponentRef,
  Inject,
  OnDestroy,
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
import { map, switchMap, takeUntil } from 'rxjs/operators';
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
export class AppComponent implements OnInit, OnDestroy {
  loadLangSuccess = false;

  keyword = '';
  page = 1;
  pageSize = 25;

  queries$ = new BehaviorSubject<SearchAvatarsParams>({
    keyword: this.keyword,
    page: this.page,
    pageSize: this.pageSize,
    tags: ['humanoid'],
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

  destroy$ = new Subject<boolean>();

  @ViewChild(AvatarPreviewComponent) avatarPreview: AvatarPreviewComponent;

  constructor(
    private translate: TranslateService,
    private appService: AppService,
    private messageService: MessageService,
    private dialog: DialogService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en').subscribe((data) => {
      this.loadLangSuccess = true;
    });
  }

  ngOnInit(): void {
    this.setupDataListenners();
    this.initCategories();
  }

  private setupDataListenners() {
    this.appService.refreshTrigger$
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.loadData();
        }
      });

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
    this.queries$.next(
      Object.assign(this.queries$.getValue(), {
        page: this.page,
        pageSize: this.pageSize,
        keyword: this.keyword,
        ...(this.selectedSortOption && {
          sorts: [this.selectedSortOption.value],
        }),
        ...(this.type && {
          type: this.type,
        }),
      })
    );
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
    const dialogRef = this.dialog.open(AvatarAssetsUploadComponent, {
      header: 'Create Avatar',
      width: '920px',
      data: {
        humanoidDescNode,
      },
    });

    dialogRef.onClose.subscribe((data) => {
      if (data == true) {
        this.loadData();
        this.messageService.add({
          severity: 'success',
          detail: 'Sava and upload success!',
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
