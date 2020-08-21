import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { CSSProperties } from 'styled-components';

interface IWrapProps {
  position: 'flex-start' | 'center';
}

const ModalOverlay = styled.div<IWrapProps>`
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 3;
  overflow: auto;
  box-sizing: border-box;
  cursor: pointer;
`;

const ModalWrap = styled.div`
  position: relative;
  z-index: 3;
  padding: 32px;
  display: flex;
  align-items: center;
  flex: 1 0 auto;

  @media (max-width: ${(props): string => props.theme.global.breakpoints.small.value}px) {
    position: absolute;
    padding: 0;
    left: 0;
    top: 0;
    right: 0;

    min-height: 100vh;

    display: flex;
    align-items: stretch;
  }
`;

const Modal = styled.div`
  position: relative;
  z-index: 4;
  background-color: #fff;
  box-sizing: border-box;
  border-radius: 4px;
  cursor: auto;

  @media (max-width: ${(props): string => props.theme.global.breakpoints.small.value}px) {
    flex: 1;
  }
`;

export const ModalView: React.FC<
  {
    width: string;
    onClose: () => void;
    style: CSSProperties;
    children: React.ReactNode;
    isOverlayClose?: boolean;
    config?: any;
  } & IWrapProps
> = ({
  width = '700px',
  position = 'center',
  onClose,
  style,
  children,
  isOverlayClose,
  config,
}) => {
  const overlayRef = React.useRef(null);
  const modalWrapRef = React.useRef(null);
  React.useEffect(() => {
    config.scrollTo = () => {
      overlayRef.current.scrollTo(0, modalWrapRef.current.offsetHeight);
    };
  }, []);

  return ReactDOM.createPortal(
    <ModalOverlay
      ref={overlayRef}
      position={position}
      onClick={() => isOverlayClose && onClose()}
      style={style}
    >
      <ModalWrap ref={modalWrapRef}>
        <Modal
          style={{ width }}
          onClick={(event: any) => {
            event.stopPropagation();
          }}
        >
          {children}
        </Modal>
      </ModalWrap>
    </ModalOverlay>,
    document.body
  );
};
ModalView.displayName = 'ModalView';
