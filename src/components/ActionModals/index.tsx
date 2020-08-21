import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Header } from './components';
import { Footer } from '../Footer';
import { ActionModalConfig } from 'stores/ActionModalsStore';
import { useMemo, useRef } from 'react';
import { observable } from 'mobx';
import { ModalView, Button } from 'components/Base';

export type TActionModalProps<T = any> = {
  config: ActionModalConfig;
  actionData: TActionDataType<T>;
  ref: any;
  onValidate: {
    callback?: () => Promise<any>;
  };
};

export type TActionDataType<T = any> = {
  isValid: boolean;
  data?: T;
};

function isClassComponent(component: any) {
  return (
    (!!component.prototype && !!component.prototype.isReactComponent) ||
    typeof component !== 'function'
  );
}

export const ActionModal = observer<{
  config: ActionModalConfig;
  visible: boolean;
}>(({ config, visible }) => {
  const { actionModals } = useStores();
  const { render: Render, options, id } = config;

  const actionData = useMemo(
    () =>
      observable({
        isValid: config.options.noValidation,
        data: config.options.initData || {},
      }),
    [],
  );

  const bodyRef = useRef<{ onValidate?: () => Promise<any> }>();

  const { width = '750px', position = 'center' } = options;

  const onClose = () => actionModals.close(id);

  const isActionLoading = config.actionStatus === 'fetching';

  const onApply = (data: any) => {
    config.actionStatus = 'fetching';

    return options
      .onApply(data)
      .then(res => {
        config.actionStatus = 'success';

        return res;
      })
      .catch((err: any) => {
        config.actionStatus = 'error';

        throw err;
      });
  };

  const onValidate: { callback?: () => Promise<any> } = useMemo(() => ({}), []);

  return (
    <ModalView
      width={width}
      position={position}
      onClose={onClose}
      style={{ visibility: visible ? 'visible' : 'hidden' }}
      config={config}
    >
      {false ? (
        <Header
          title={options.title}
          onClose={onClose}
          pending={isActionLoading}
        />
      ) : null}
      {!isClassComponent(Render) ? (
        Render({ actionData })
      ) : (
        <Render
          config={config}
          actionData={actionData}
          onValidate={onValidate}
          ref={bodyRef}
        />
      )}
      <Footer>
        {options.closeText && (
          <Button
            size="auto"
            transparent
            onClick={onClose}
            color="Basic700"
            disabled={isActionLoading}
          >
            {options.closeText}
          </Button>
        )}
        {options.applyText ? (
          <Button
            margin="0 0 0 24px"
            size="auto"
            onClick={() => {
              if (bodyRef && bodyRef.current && onValidate.callback) {
                onValidate
                  .callback()
                  .then(onApply)
                  .catch((err: any) => {
                    config.actionStatus = 'error';
                    actionModals.rejectError(config.id, err);
                    throw err;
                  });
              } else {
                onApply(actionData.data);
              }
            }}
            disabled={isActionLoading || !actionData.isValid}
          >
            {options.applyText || 'Ok'}
          </Button>
        ) : null}
      </Footer>
    </ModalView>
  );
});

export const ActionModals: React.FC = observer(() => {
  const { actionModals } = useStores();

  return (
    <>
      {actionModals.pool.map((config, idx) => (
        <ActionModal
          key={config.id}
          config={config}
          visible={actionModals.pool.length - 1 === idx}
        />
      ))}
    </>
  );
});
