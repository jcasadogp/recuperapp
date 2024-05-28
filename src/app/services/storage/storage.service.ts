import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    console.log("Init Storage")
  }
 
  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  async get(key: string) {
    return this._storage?.get(key) || [];
  }

  async remove(key: string) {
    return this._storage?.remove(key) || [];
  }
}