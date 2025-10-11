"use client";

import {
  Home,
  User2,
  ChevronUp,
  Plus,
  ChevronDown,
  Box,
  Warehouse,
  LogOut,
  ChartBar,
  Truck,
  Users,
  Shield,
  List,
  ShoppingCart,
  Percent,
  Building,
  ArrowLeft,
  Settings,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { apiClient } from "@/lib/api";

const itemsBeforeSells = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Setup",
    url: "/dashboard/setup",
    icon: Settings,
  },
  {
    title: "Roles",
    url: "/dashboard/roles",
    icon: Shield,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Branches",
    url: "/dashboard/branches",
    icon: Building,
  },
  {
    title: "Taxes",
    url: "/dashboard/taxes",
    icon: Percent,
  },
  {
    title: "Suppliers",
    url: "/dashboard/suppliers",
    icon: Truck,
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: List,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Box,
  },
  {
    title: "Stocks",
    url: "/dashboard/stocks",
    icon: Warehouse,
  },
  
];

const reportsSubItems = [
  {
    title: "Sell Report",
    url: "/dashboard/sells",
    icon: FileText,
  },
  {
    title: "Vendor Report",
    url: "/dashboard/vendor-report",
    icon: Truck,
  },
  // {
  //   title: "Loss/Profit",
  //   url: "/dashboard/reports/loss-profit",
  //   icon: TrendingUp,
  // },
  {
    title: "Return",
    url: "/dashboard/return",
    icon: ArrowLeft,
  },
];

const AppSidebar = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (!pathname) return false;
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(url + "/");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await apiClient.logout();
      // Redirect to login page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if there's an error
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="text-white"
      // style={{
      //   // Override shadcn sidebar CSS variables for consistent coloring
      //   ["--sidebar" as any]: "oklch(0.42 0.17 262)", // purple background
      //   ["--sidebar-foreground" as any]: "oklch(0.985 0 0)", // white text
      //   ["--sidebar-accent" as any]: "oklch(0.32 0.12 277)", // hover
      //   ["--sidebar-accent-foreground" as any]: "oklch(0.985 0 0)",
      //   ["--sidebar-border" as any]: "oklch(1 0 0 / 12%)",
      //   ["--sidebar-ring" as any]: "oklch(0.56 0.18 277)",
      // }}
    >
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image src="/icon/icon.png" alt="logo" width={30} height={30} />
                <span className="text-2xl font-bold text-yellow-500">Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="bg-white/20" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-black/80 dark:text-yellow-400">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsBeforeSells.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`${
                      isActive(item.url)
                        ? "bg-black text-yellow-400 rounded-md px-0.2"
                        : "text-black hover:bg-black/10 dark:text-white"
                    }`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Sells Collapsible Section */}
        <Collapsible className="group/collapsible">
          <SidebarMenu>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="text-black hover:bg-black/10 dark:text-white">
                  <ShoppingCart />
                  <span>Sells</span>
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`${
                    isActive("/dashboard/create-order")
                      ? "bg-black text-yellow-400 rounded-md"
                      : "text-black hover:bg-black/10 dark:text-white"
                  }`}
                >
                  <Link href="/dashboard/create-order">
                    <Plus />
                    Create Sells
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`${
                    isActive("/dashboard/orders")
                      ? "bg-black text-yellow-400 rounded-md"
                      : "text-black hover:bg-black/10 dark:text-white"
                  }`}
                >
                  <Link href="/dashboard/orders">
                    <List />
                    Manage Sells
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`${
                    isActive("/dashboard/return-order")
                      ? "bg-black text-yellow-400 rounded-md"
                      : "text-black hover:bg-black/10 dark:text-white "
                  }`}
                >
                  <Link href="/dashboard/return-order">
                    <ArrowLeft />
                    Return Sell
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </CollapsibleContent>
          </SidebarMenu>
        </Collapsible>
        
        {/* Reports Collapsible Section */}
        <Collapsible className="group/collapsible">
          <SidebarMenu>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="text-black hover:bg-black/10 dark:text-white">
                  <ChartBar />
                  <span>Reports</span>
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              {reportsSubItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`${
                      isActive(item.url)
                        ? "bg-black text-yellow-400 rounded-md p-2"
                        : "text-black hover:bg-black/10 dark:text-white"
                    }`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </CollapsibleContent>
          </SidebarMenu>
        </Collapsible>
        
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="text-black hover:bg-black/10 dark:text-white">
                  <User2 /> Admin <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/change-pass">Change Password</Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 hover:text-red-700 focus:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
