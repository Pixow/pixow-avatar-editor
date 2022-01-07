import { NgModule } from '@angular/core';
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
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import PixowApi from 'pixow-api';
import { ImageService } from 'pixowor-core';
import { AppService } from './app.service';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

function initPixowApi() {
  const pixowApi = new PixowApi();
  pixowApi.setTokenHeader(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjYWFmZDgxZWI4MmE4NmY2YTM0YTJlMiIsInJvbGUiOjAsImNyZWRlbnRpYWwiOiJNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xNV83KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvOTYuMC40NjY0LjExMCBTYWZhcmkvNTM3LjM2IiwiaWF0IjoxNjQwMjQxODIzLCJleHAiOjE2NDI4NjgzODN9.oZ7jJjRgdpbm5ymDAG3O3VWqJe8casBhpFK6DLvAcXg'
  );
  return pixowApi;
}
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
      useDefaultLang: true,
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
    ImageService,
    { provide: PixowApi, useFactory: initPixowApi },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
