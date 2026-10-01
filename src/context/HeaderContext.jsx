import React, { createContext, useContext, useState } from 'react';

const HeaderContext = createContext({
  headerState: null,
  setHeaderState: () => {},
});

export const HeaderProvider = ({ children }) => {
  const [headerState, setHeaderState] = useState(null);

  return (
    <HeaderContext.Provider value={{ headerState, setHeaderState }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);

export default HeaderContext;
