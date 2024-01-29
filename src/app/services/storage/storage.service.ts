import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

  private _storage: Storage | null = null;

    constructor(private storage: Storage) {
      //this.init(); //No es del todo correcto (aunque suele funcionar)
     }

    async init(){
      await this.storage.defineDriver(CordovaSQLiteDriver);
      const storage = await this.storage.create();
      this._storage = storage;
    }

    async setString(key: string, value: string) {
      await this._storage?.set(key, value);
    }

    // getString(key: string) {
    //   return this._storage.get(key) || [];
    // }

    async setObject(key: string, value: any) {
      await this._storage?.set(key, JSON.stringify(value));
    }

    // getObject(key: string) {
    //     return this._storage.get(key) || [];
    //   //  return JSON.parse(ret);
    // }

    // async removeItem(key: string) {
    //     await this._storage.remove(key) || [];
    // }

    // async clear() {
    //     await this._storage.clear();
    // }
}