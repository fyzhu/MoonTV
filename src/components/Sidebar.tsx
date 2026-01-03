/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Clover, Film, Home, Search, Star, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface SidebarContextType {
  isCollapsed: boolean;
}

const SidebarContext = createContext({
  isCollapsed: false,
} as SidebarContextType);

export const useSidebar = () => useContext(SidebarContext);

// 可替换为你自己的 logo 图片
const Logo = () => {
  const { siteName } = useSite();
  return (
    <Link
      href='/'
      className='flex items-center justify-center h-16 select-none hover:opacity-80 transition-opacity duration-200'
    >
      <span className='text-2xl font-bold text-green-600 tracking-tight'>
        {siteName}
      </span>
    </Link>
  );
};

interface SidebarProps {
  activePath?: string;
}

const Sidebar = ({ activePath = '/' }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 折叠功能已移除，默认始终展开
  const isCollapsed = false;

  const [active, setActive] = useState(activePath);

  useEffect(() => {
    // 优先使用传入的 activePath
    if (activePath) {
      setActive(activePath);
    } else {
      // 否则使用当前路径
      const getCurrentFullPath = () => {
        const queryString = searchParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
      };
      const fullPath = getCurrentFullPath();
      setActive(fullPath);
    }
  }, [activePath, pathname, searchParams]);

  // const handleToggle = useCallback(() => {
  //   const newState = !isCollapsed;
  //   setIsCollapsed(newState);
  //   localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  //   if (typeof window !== 'undefined') {
  //     window.__sidebarCollapsed = newState;
  //   }
  //   onToggle?.(newState);
  // }, [isCollapsed, onToggle]);

  const handleSearchClick = useCallback(() => {
    router.push('/search');
  }, [router]);

  const contextValue = {
    isCollapsed,
  };

  const [menuItems, setMenuItems] = useState([
    {
      icon: Film,
      label: '电影',
      href: '/douban?type=movie',
    },
    {
      icon: Tv,
      label: '剧集',
      href: '/douban?type=tv',
    },
    {
      icon: Clover,
      label: '综艺',
      href: '/douban?type=show',
    },
  ]);

  useEffect(() => {
    const runtimeConfig = (window as any).RUNTIME_CONFIG;
    if (runtimeConfig?.CUSTOM_CATEGORIES?.length > 0) {
      setMenuItems((prevItems) => [
        ...prevItems,
        {
          icon: Star,
          label: '自定义',
          href: '/douban?type=custom',
        },
      ]);
    }
  }, []);

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* 在移动端隐藏侧边栏；桌面端改为顶部横幅（非固定） */}
      <div className='hidden md:block'>
        <header
          data-sidebar
          role='banner'
          className='bg-white/40 backdrop-blur-xl transition-all duration-300 border-b border-gray-200/50 z-10 shadow-lg dark:bg-gray-900/70 dark:border-gray-700/50 w-full'
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className='max-w-[1280px] mx-auto flex items-center justify-between h-16 px-4'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center h-10'>
                {!isCollapsed && <Logo />}
              </div>

              <nav className='hidden sm:flex items-center gap-2'>
                <Link
                  href='/'
                  onClick={() => setActive('/')}
                  data-active={active === '/'}
                  className='group flex items-center rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-green-400 dark:data-[active=true]:bg-green-500/10 dark:data-[active=true]:text-green-400 gap-2'
                >
                  <Home className='h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700 dark:text-gray-400 dark:group-hover:text-green-400 dark:data-[active=true]:text-green-400' />
                  {!isCollapsed && (
                    <span className='whitespace-nowrap'>首页</span>
                  )}
                </Link>
                <Link
                  href='/search'
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearchClick();
                    setActive('/search');
                  }}
                  data-active={active === '/search'}
                  className='group flex items-center rounded-lg px-2 py-2 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-green-400 dark:data-[active=true]:bg-green-500/10 dark:data-[active=true]:text-green-400 gap-2'
                >
                  <Search className='h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700 dark:text-gray-400 dark:group-hover:text-green-400 dark:data-[active=true]:text-green-400' />
                  {!isCollapsed && (
                    <span className='whitespace-nowrap'>搜索</span>
                  )}
                </Link>
              </nav>
            </div>

            <div className='flex-1 mx-4'>
              <div className='flex items-center gap-2 overflow-x-auto'>
                {menuItems.map((item) => {
                  const typeMatch = item.href.match(/type=([^&]+)/)?.[1];
                  const decodedActive = decodeURIComponent(active);
                  const decodedItemHref = decodeURIComponent(item.href);
                  const isActive =
                    decodedActive === decodedItemHref ||
                    (decodedActive.startsWith('/douban') &&
                      decodedActive.includes(`type=${typeMatch}`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActive(item.href)}
                      data-active={isActive}
                      className='group flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 transition-colors duration-200 dark:text-gray-300 dark:hover:text-green-400 dark:data-[active=true]:bg-green-500/10 dark:data-[active=true]:text-green-400 gap-2'
                    >
                      <Icon className='h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700 dark:text-gray-400 dark:group-hover:text-green-400 dark:data-[active=true]:text-green-400' />
                      {!isCollapsed && (
                        <span className='whitespace-nowrap transition-opacity duration-200 opacity-100'>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2'>
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
