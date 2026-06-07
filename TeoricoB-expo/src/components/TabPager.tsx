import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import PagerView from 'react-native-pager-view';

export interface TabPagerHandle {
  setPage: (idx: number) => void;
}

interface Props {
  initialPage?: number;
  scrollEnabled?: boolean;
  onPageSelected?: (position: number) => void;
  children: React.ReactNode;
  style?: any;
}

const TabPager = forwardRef<TabPagerHandle, Props>(({ initialPage = 0, scrollEnabled = true, onPageSelected, children, style }, ref) => {
  const pagerRef = useRef<PagerView>(null);
  useImperativeHandle(ref, () => ({
    setPage: (idx: number) => pagerRef.current?.setPage(idx),
  }), []);

  return (
    <PagerView
      ref={pagerRef}
      style={style}
      initialPage={initialPage}
      scrollEnabled={scrollEnabled}
      onPageSelected={e => onPageSelected?.(e.nativeEvent.position)}
    >
      {children}
    </PagerView>
  );
});
TabPager.displayName = 'TabPager';

export default TabPager;
