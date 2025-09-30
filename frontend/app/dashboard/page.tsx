"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  TrendingUp, 
  Bell, 
  Filter,
  Search,
  Calendar,
  MapPin,
  Tag,
  Clock,
  ExternalLink,
  Star,
  Shield,
  Zap
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { policyService } from "@/services/policy.service";
import { notificationService } from "@/services/notification.service";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "react-toastify";

interface PolicyItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  region: string;
  industry: string;
  publishDate: string;
  category: string;
  level: string;
  riskLevel: string;
  signals: string[];
  confidence: number;
  url: string;
  tags: string[];
}

interface BidItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  region: string;
  industry: string;
  publishDate: string;
  deadline: string;
  budget: string;
  opportunity: string;
  url: string;
  tags: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"policies" | "bids">("policies");
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [bids, setBids] = useState<BidItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    loadDashboardData();
  }, [isAuthenticated, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 加载政策数据
      const policiesData = await policyService.getPolicies({
        page: 1,
        pageSize: 20,
        keywords: searchQuery ? [searchQuery] : undefined,
        regions: selectedRegion !== "all" ? [selectedRegion] : undefined,
        industries: selectedIndustry !== "all" ? [selectedIndustry] : undefined
      });
      setPolicies(policiesData.data);
      
      // 加载招标数据
      const bidsData = await policyService.getBids({
        page: 1,
        pageSize: 20,
        keywords: searchQuery ? [searchQuery] : undefined,
        regions: selectedRegion !== "all" ? [selectedRegion] : undefined,
        industries: selectedIndustry !== "all" ? [selectedIndustry] : undefined
      });
      setBids(bidsData.data);
      
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("加载数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadDashboardData();
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "opportunity":
        return <TrendingUp className="w-3 h-3" />;
      case "risk":
        return <Shield className="w-3 h-3" />;
      case "trend":
        return <Zap className="w-3 h-3" />;
      default:
        return <Tag className="w-3 h-3" />;
    }
  };

  const PolicyCard = ({ policy }: { policy: PolicyItem }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
              {policy.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {policy.summary}
            </CardDescription>
          </div>
          <Badge className={`ml-2 ${getRiskLevelColor(policy.riskLevel)}`}>
            {policy.riskLevel === "high" ? "高风险" : policy.riskLevel === "medium" ? "中风险" : "低风险"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {policy.signals.map((signal, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {getSignalIcon(signal)}
              <span className="ml-1">{signal}</span>
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDistanceToNow(new Date(policy.publishDate), { locale: zhCN })}前
          </div>
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {policy.region}
          </div>
          <div className="flex items-center">
            <Tag className="w-3 h-3 mr-1" />
            {policy.industry}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Star className="w-3 h-3 mr-1" />
            置信度: {(policy.confidence * 100).toFixed(0)}%
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(policy.url, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            查看原文
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const BidCard = ({ bid }: { bid: BidItem }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
              {bid.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {bid.summary}
            </CardDescription>
          </div>
          <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            {bid.budget}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            {bid.opportunity}
          </Badge>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDistanceToNow(new Date(bid.publishDate), { locale: zhCN })}前
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            截止: {formatDistanceToNow(new Date(bid.deadline), { locale: zhCN })}
          </div>
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {bid.region}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Tag className="w-3 h-3 mr-1" />
            {bid.industry}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(bid.url, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            查看详情
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PolicyPulse
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/settings")}
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/settings")}
              >
                设置
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // 这里应该调用logout函数
                  router.push("/login");
                }}
              >
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            欢迎回来，{user?.name || "用户"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            这里是您的政策情报中心，为您实时监控最新的政策和招标信息
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索政策或招标信息..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">全部地区</option>
                <option value="全国">全国</option>
                <option value="北京市">北京市</option>
                <option value="上海市">上海市</option>
                <option value="广东省">广东省</option>
              </select>
              
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">全部行业</option>
                <option value="信息技术">信息技术</option>
                <option value="金融服务">金融服务</option>
                <option value="制造业">制造业</option>
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRegion("all");
                  setSelectedIndustry("all");
                  setSelectedLevel("all");
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                重置筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "policies" | "bids")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="policies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600">
              <FileText className="w-4 h-4 mr-2" />
              政策信息
            </TabsTrigger>
            <TabsTrigger value="bids" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              招标信息
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="policies" className="mt-0">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0">
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full mt-2" />
                      <Skeleton className="h-3 w-2/3 mt-1" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6 mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">暂无政策信息</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  系统正在为您实时监控最新的政策动态
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {policies.map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bids" className="mt-0">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0">
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full mt-2" />
                      <Skeleton className="h-3 w-2/3 mt-1" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6 mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : bids.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">暂无招标信息</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  系统正在为您实时监控最新的招标动态
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}