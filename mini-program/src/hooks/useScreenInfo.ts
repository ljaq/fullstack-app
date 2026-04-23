export default function useScreenInfo() {
  const sysInfo = uni.getSystemInfoSync();
  const menuButtonObject = uni.getMenuButtonBoundingClientRect?.();
  const statusBarHeight = sysInfo.statusBarHeight;
  const menuButtonHeight = menuButtonObject?.height ?? 44;
  const menuButtonTop = menuButtonObject?.top ?? 0;

  return {
    // 导航栏高度
    navBarHeight: menuButtonHeight + (menuButtonTop - statusBarHeight!) * 2 + statusBarHeight!,
    // 状态栏高度
    statusBarHeight: statusBarHeight || 0,
    // 底部安全区高度
    safeAreaBottom: sysInfo.screenHeight - (sysInfo.safeArea?.bottom ?? 0),
    // 屏幕宽度
    screenWidth: sysInfo.screenWidth,
    // 屏幕高度
    screenHeight: sysInfo.screenHeight,
  };
}
