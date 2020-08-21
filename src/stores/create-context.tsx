import * as React from 'react';

const useContext = React.useContext;

interface Props<TStores> {
  stores: TStores;
  children?: React.ReactNode;
}

export function createStoresContext<T>() {
  const StoresContext = React.createContext<T | null>(null);
  function StoresProvider({ stores, children }: Props<T>) {
    return (
      <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>
    );
  }
  const useStores = () => {
    const stores = useContext(StoresContext);
    if (!stores) {
      throw new Error('useStores must be used within a StoreProvider.');
    }
    return stores;
  };

  return {
    StoresProvider,
    useStores,
  };
}
