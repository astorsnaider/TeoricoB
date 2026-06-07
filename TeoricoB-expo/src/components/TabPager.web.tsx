import React, { forwardRef, useImperativeHandle, useState, useEffect, Children } from 'react';
import { View } from 'react-native';

export interface TabPagerHandle {
  setPage: (idx: number) => void;
}

interface Props {
  initialPage?: number;
  onPageSelected?: (position: number) => void;
  children: React.ReactNode;
  style?: any;
}

/**
 * Fallback Web: sin gesto swipe (PagerView no funciona en web).
 * Solo cambia la página por imperative handle desde el caller (tabs).
 */
const TabPager = forwardRef<TabPagerHandle, Props>(({ initialPage = 0, onPageSelected, children, style }, ref) => {
  const [page, setPage] = useState(initialPage);
  useImperativeHandle(ref, () => ({
    setPage: (idx: number) => setPage(idx),
  }), []);

  useEffect(() => {
    onPageSelected?.(page);
  }, [page]);

  const arr = Children.toArray(children);
  return <View style={style}>{arr[page]}</View>;
});
TabPager.displayName = 'TabPager';

export default TabPager;
