import {
  APP_INITIALIZER,
  InjectionToken,
  Injector,
  NgModule,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { PanelMenuModule } from 'primeng/panelmenu';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { AppComponent } from './app.component';
import { AvatarCardComponent } from 'src/app/components/avatar-card/avatar-card.component';
import { AvatarAssetsUploadComponent } from 'src/app/components/avatar-assets-upload/avatar-assets-upload.component';
import { AvatarSlotComponent } from 'src/app/components/avatar-slot/avatar-slot.component';
import { AvatarPreviewComponent } from 'src/app/components/avatar-preview/avatar-preview.component';

import { DateAgoPipe } from 'src/app/pipes/date-ago.pipe';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import PixowApi from 'pixow-api';
import { AppService } from './app.service';
import { MessageService } from 'primeng/api';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initPixowApi() {
  const pixowApi = new PixowApi();
  pixowApi.setTokenHeader(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjYWFmZDgxZWI4MmE4NmY2YTM0YTJlMiIsInJvbGUiOjAsImNyZWRlbnRpYWwiOiJNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xNV83KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvOTYuMC40NjY0LjExMCBTYWZhcmkvNTM3LjM2IiwiaWF0IjoxNjQwMjQxODIzLCJleHAiOjE2NDI4NjgzODN9.oZ7jJjRgdpbm5ymDAG3O3VWqJe8casBhpFK6DLvAcXg'
  );
  return pixowApi;
}

// https://github.com/ngx-translate/core/issues/517
export function appInitializerFactory(
  translate: TranslateService,
  injector: Injector
) {
  return () =>
    new Promise<any>((resolve: any) => {
      const locationInitialized = injector.get(
        LOCATION_INITIALIZED,
        Promise.resolve(null)
      );
      locationInitialized.then(() => {
        const langToSet = 'zh-CN';
        translate.setDefaultLang('zh-CN');
        translate.use(langToSet).subscribe(
          () => {
            console.info(`Successfully initialized '${langToSet}' language.'`);
          },
          (err) => {
            console.error(
              `Problem with '${langToSet}' language initialization.'`
            );
          },
          () => {
            resolve(null);
          }
        );
      });
    });
}

export const WEB_RESOURCE_URI = new InjectionToken('WEB_RESOURCE_URI');
@NgModule({
  declarations: [
    AppComponent,
    AvatarCardComponent,
    DateAgoPipe,
    AvatarPreviewComponent,
    AvatarAssetsUploadComponent,
    AvatarSlotComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ScrollingModule,
    BrowserAnimationsModule,
    PaginatorModule,
    ButtonModule,
    DropdownModule,
    HttpClientModule,
    DynamicDialogModule,
    FileUploadModule,
    PanelMenuModule,
    InputTextModule,
    ToastModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      isolate: false,
    }),
    NgxTippyModule,
  ],
  providers: [
    AppService,
    MessageService,
    { provide: WEB_RESOURCE_URI, useValue: 'https://osd-alpha.tooqing.com' },
    { provide: PixowApi, useFactory: initPixowApi },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
