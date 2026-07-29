/**
 * 主题契约 — 布局 Props 接口
 */

export interface NavOption {
  id: string;
  label: string;
  /** 内部路由路径（如 "/posts"）或外部 URL（如 "https://example.com"） */
  to: string;
  /** true 时为外链，渲染为 <a>；否则渲染为内部 <Link> */
  external?: boolean;
  /** 外链是否在新窗口打开 */
  openInNewTab?: boolean;
}

export interface UserInfo {
  name: string;
  image?: string | null;
  role?: string | null;
}

export interface PublicLayoutProps {
  children: React.ReactNode;
  navOptions: Array<NavOption>;
  user?: UserInfo;
  isSessionLoading: boolean;
  logout: () => Promise<void>;
}

export interface AuthLayoutProps {
  onBack: () => void;
  children: React.ReactNode;
}

export interface UserLayoutProps {
  isAuthenticated: boolean;
  navOptions: Array<NavOption>;
  user?: UserInfo;
  isSessionLoading: boolean;
  logout: () => Promise<void>;
  children: React.ReactNode;
}
