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

  private async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    console.log("Init Storage")
  }

  public set(key: string, value: any): Promise<void> {
    return this._storage?.set(key, value) ?? Promise.reject('Storage not initialized');
  }

  public get(key: string): Promise<any> {
    return this._storage?.get(key) ?? Promise.resolve(null);
  }

  public remove(key: string): Promise<void> {
    return this._storage?.remove(key) ?? Promise.reject('Storage not initialized');
  }
 
  public set_old(key: string, value: any) {
    this._storage?.set(key, value);
  }

  async get_old(key: string) {
    return this._storage?.get(key) || [];
  }

  async remove_old(key: string) {
    return this._storage?.remove(key) || [];
  }
}
