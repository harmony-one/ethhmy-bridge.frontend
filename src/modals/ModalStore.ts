import { ModalMap } from './types';
import { action, observable } from 'mobx';

export class ModalStore {
  @observable
  public _modalMap: ModalMap = {} as ModalMap;

  @action
  public addModal<K extends keyof ModalMap>(
    modalId: K,
    modalItem: ModalMap[K],
  ) {
    this._modalMap[modalId] = modalItem;
  }

  public removeModal<K extends keyof ModalMap>(modalId: K) {
    delete this._modalMap[modalId];
  }

  public getModal<K extends keyof ModalMap>(modalId: K): ModalMap[K] {
    return this._modalMap[modalId];
  }
}
