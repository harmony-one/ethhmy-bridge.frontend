import { action, observable } from 'mobx';
import { ReactRenderFn } from 'interfaces';

export interface IModalProps {
  width?: string;
  position?: 'flex-start' | 'center';
  isOverlayClose?: boolean;
}

export class ModalsStore {
  @observable
  public render?: ReactRenderFn;
  public options?: IModalProps;
  public onClose?: () => any;

  public scrollTo?: () => void;

  @action.bound
  public openModal = (
    render: ReactRenderFn,
    onClose?: () => any,
    options?: IModalProps,
  ) => {
    this.render = render;
    this.options = options;
    this.onClose = onClose;
  };

  @action.bound
  public closeModal = () => {
    this.render = null;

    if (this.onClose instanceof Function) {
      this.onClose();
    }
  };
}
