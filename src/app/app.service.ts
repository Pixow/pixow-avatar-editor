import { Inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  from,
  Observable,
  catchError,
  throwError,
} from 'rxjs';
import { map } from 'rxjs/operators';
import PixowApi, { Avatar, SearchAvatarsParams } from 'pixow-api';
import { AvatarModel } from './models/avatar.model';
import { MessageService } from 'primeng/api';

export interface GetAvatarsResponse {
  total: number;
  avatars: AvatarModel[];
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private pixowApi: PixowApi) {}

  getAvatars(query?: SearchAvatarsParams): Observable<GetAvatarsResponse> {
    return from(this.pixowApi.getAllAvatars(query)).pipe(
      map((res) => {
        console.log('res: ', res);
        const { code, data } = res;
        const avatars = data.list.map((item) => {
          return new AvatarModel(item);
        });

        return { total: data.total, avatars };
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  // public getQiniuToken(name: string): Promise<string> {
  //   return this.pixoworCore.pixowApi.util.getQiniuToken({ name });
  // }
}
