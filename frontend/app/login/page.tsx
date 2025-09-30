"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    verificationCode: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVerification, setShowVerification] = useState(false);

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "邮箱不能为空";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "邮箱格式不正确";
    }
    
    if (!formData.password) {
      newErrors.password = "密码不能为空";
    } else if (formData.password.length < 8) {
      newErrors.password = "密码长度至少8位";
    }
    
    if (showVerification && !formData.verificationCode) {
      newErrors.verificationCode = "验证码不能为空";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      toast.error("请先输入邮箱地址");
      return;
    }
    
    try {
      setIsLoading(true);
      await authService.sendVerificationCode(formData.email, "register");
      setCountdown(60);
      toast.success("验证码已发送，请查收邮件");
    } catch (error) {
      toast.error("发送验证码失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (showVerification) {
        // 注册流程
        await authService.register({
          email: formData.email,
          name: formData.email.split("@")[0],
          password: formData.password,
          verification_code: formData.verificationCode
        });
        
        // 注册成功后自动登录
        await login(formData.email, formData.password);
        toast.success("注册成功！");
      } else {
        // 登录流程
        await login(formData.email, formData.password);
        toast.success("登录成功！");
      }
      
      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message;
      
      if (message.includes("验证码")) {
        setShowVerification(true);
        toast.info("请先完成邮箱验证");
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PolicyPulse
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {showVerification ? "完成邮箱验证" : "登录您的账户"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            {showVerification && (
              <div className="space-y-2">
                <Label htmlFor="verificationCode">验证码</Label>
                <div className="flex space-x-2">
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    placeholder="请输入验证码"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    className={errors.verificationCode ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isLoading}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : "获取验证码"}
                  </Button>
                </div>
                {errors.verificationCode && (
                  <p className="text-sm text-red-500">{errors.verificationCode}</p>
                )}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {showVerification ? "注册中..." : "登录中..."}
                </>
              ) : (
                showVerification ? "完成注册" : "登录"
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {showVerification ? (
              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                返回登录
              </button>
            ) : (
              <>
                还没有账户？{" "}
                <button
                  type="button"
                  onClick={() => setShowVerification(true)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  立即注册
                </button>
              </>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              忘记密码？
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}