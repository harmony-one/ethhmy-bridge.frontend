export interface CommonFilterBodyProps {
  value: any;
  fieldName: string;
  renderMap?: Record<string, string>;
  onClose: () => any;
  onChange: (index: string, value: any) => void;
  renderOptions?: {
    checkboxOptionsPromise: (fieldName: string, params?: any) => Promise<string[]>;
  };
  placeholder?: string;
}
