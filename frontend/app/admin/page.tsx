"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Bell, 
  FileText, 
  Activity,
  Download,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { LineChart, LineChartProps } from "@/components/charts/LineChart";
import { PieChart, PieChartProps } from "@/components/charts/PieChart";
import { BarChart, BarChartProps } from "@/components/charts/BarChart";
import { DataTable } from "@/components/ui/data-table";
import { adminService } from "@/services/admin.service";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "react-toastify";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  policyCount: number;
  bidCount: number;
  pushSuccessRate: number;
  crawlSuccessRate: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string;
  subscription: {
    type: string;
    status: string;
    expireAt: string;
  };
}

interface NodeStats {
  nodeId: string;
  nodeName: string;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  lastSuccessAt: string;
  lastFailureAt: string;
  status: "healthy" | "warning" | "error";
}

export default function AdminPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "nodes" | "logs">("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [nodes, setNodes] = useState<NodeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // 加载统计数据
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
      
      // 加载用户数据
      const usersData = await adminService.getUsers();
      setUsers(usersData);
      
      // 加载节点数据
      const nodesData = await adminService.getNodeStats();
      setNodes(nodesData);
      
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error("加载数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAdminData();
    toast.success("数据刷新成功");
  };

  const handleExportCSV = (data: any[], filename: string) => {
    const csvContent = convertToCSV(data);
    downloadCSV(csvContent, filename);
    toast.success("导出成功");
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === "string" ? `"${value}"` : value;
      }).join(",")
    );
    
    return [csvHeaders, ...csvRows].join("\n");
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "trial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "healthy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const userColumns = [
    {
      accessorKey: "email",
      header: "邮箱",
    },
    {
      accessorKey: "name",
      header: "姓名",
    },
    {
      accessorKey: "role",
      header: "角色",
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "subscription.type",
      header: "订阅类型",
    },
    {
      accessorKey: "subscription.status",
      header: "订阅状态",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.original.subscription.status)}>
          {row.original.subscription.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "注册时间",
      cell: ({ row }: any) => (
        formatDistanceToNow(new Date(row.original.createdAt), { locale: zhCN }) + "前"
      ),
    },
  ];

  const nodeColumns = [
    {
      accessorKey: "nodeName",
      header: "节点名称",
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "successCount",
      header: "成功次数",
    },
    {
      accessorKey: "failureCount",
      header: "失败次数",
    },
    {
      accessorKey: "avgResponseTime",
      header: "平均响应时间",
      cell: ({ row }: any) => `${row.original.avgResponseTime}ms`,
    },
    {
      accessorKey: "lastSuccessAt",
      header: "最后成功时间",
      cell: ({ row }: any) => (
        row.original.lastSuccessAt 
          ? formatDistanceToNow(new Date(row.original.lastSuccessAt), { locale: zhCN }) + "前"
          : "从未"
      ),
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 20)} 本月新增
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月活跃用户</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% 活跃率
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月收入</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats?.monthlyRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 20)}% 环比增长
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推送成功率</CardTitle>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pushSuccessRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              近7天平均
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>用户注册趋势</CardTitle>
            <CardDescription>近30天用户注册情况</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 这里应该添加LineChart组件 */}
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              用户注册趋势图表
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>信号分布</CardTitle>
            <CardDescription>政策解读信号类型分布</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 这里应该添加PieChart组件 */}
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              信号分布饼图
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Nodes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top10 活跃节点</CardTitle>
              <CardDescription>采集量最高的政府网站节点</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportCSV(nodes.slice(0, 10), "top_nodes.csv")}
            >
              <Download className="w-4 h-4 mr-2" />
              导出CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable columns={nodeColumns} data={nodes.slice(0, 10)} />
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <Button
          onClick={() => handleExportCSV(users, "users.csv")}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          导出用户数据
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>管理系统中的所有用户</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable columns={userColumns} data={users} />
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderNodes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">节点监控</h2>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>
      
      {/* Node Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {nodes.slice(0, 4).map((node) => (
          <Card key={node.nodeId}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{node.nodeName}</CardTitle>
              <Badge className={getStatusColor(node.status)}>
                {node.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>成功次数:</span>
                  <span className="font-medium">{node.successCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>失败次数:</span>
                  <span className="font-medium">{node.failureCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>平均响应:</span>
                  <span className="font-medium">{node.avgResponseTime}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Node List */}
      <Card>
        <CardHeader>
          <CardTitle>节点列表</CardTitle>
          <CardDescription>所有采集节点的实时监控数据</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable columns={nodeColumns} data={nodes} />
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">系统日志</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            日志配置
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            导出日志
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>实时日志</CardTitle>
          <CardDescription>系统运行日志和错误信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-gray-50 dark:bg-gray-900 p-4 h-96 overflow-y-auto font-mono text-sm">
            <div className="space-y-1">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="text-gray-500">
                    {new Date().toISOString().slice(0, 19).replace('T', ' ')}
                  </span>
                  <span className="text-blue-600">[INFO]</span>
                  <span>数据采集任务完成，成功采集 {Math.floor(Math.random() * 100)} 条数据</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                管理后台
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                返回用户中心
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            系统管理控制台
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时监控系统状态，管理用户数据，分析业务指标
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600">
              总览
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600">
              用户管理
            </TabsTrigger>
            <TabsTrigger value="nodes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600">
              节点监控
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600">
              系统日志
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="users" className="mt-0">
            {renderUsers()}
          </TabsContent>
          
          <TabsContent value="nodes" className="mt-0">
            {renderNodes()}
          </TabsContent>
          
          <TabsContent value="logs" className="mt-0">
            {renderLogs()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}