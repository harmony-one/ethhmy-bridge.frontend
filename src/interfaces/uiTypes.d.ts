import { IStyledProps } from 'themes';
import { PropsWithChildren } from 'react';

export type ReactRenderFn = () => React.ReactNode;

export type TParams<T> = { data: T };

export declare type TTextSize =
  | 'xxsmall'
  | 'xsmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge';
  
export type IStyledChildrenProps<P> = PropsWithChildren<P> & IStyledProps;