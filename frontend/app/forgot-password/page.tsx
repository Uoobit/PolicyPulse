"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = "邮箱不能为空";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "邮箱格式不正确";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerification = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.verificationCode) {
      newErrors.verificationCode = "验证码不能为空";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = "新密码不能为空";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "密码长度至少8位";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "确认密码不能为空";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) {
      return;
    }
    
    try {
      setIsLoading(true);
      await authService.sendVerificationCode(formData.email, "reset_password");
      setCountdown(60);
      setStep("verify");
      toast.success("验证码已发送，请查收邮件");
    } catch (error) {
      toast.error("发送验证码失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!validateVerification()) {
      return;
    }
    
    try {
      setIsLoading(true);
      await authService.verifyCode(formData.email, formData.verificationCode);
      setStep("reset");
      toast.success("验证码验证成功");
    } catch (error) {
      toast.error("验证码验证失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }
    
    try {
      setIsLoading(true);
      await authService.resetPassword(
        formData.email,
        formData.verificationCode,
        formData.newPassword
      );
      
      toast.success("密码重置成功，请重新登录");
      router.push("/login");
    } catch (error) {
      toast.error("密码重置失败");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="请输入注册时的邮箱地址"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <Button
              type="button"
              onClick={handleSendCode}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading || countdown > 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  发送中...
                </>
              ) : countdown > 0 ? (
                `${countdown}秒后重试`
              ) : (
                "发送验证码"
              )}
            </Button>
          </div>
        );
        
      case "verify":
        return (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                验证码已发送至 {formData.email}，请输入验证码继续
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode">验证码</Label>
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
              {errors.verificationCode && (
                <p className="text-sm text-red-500">{errors.verificationCode}</p>
              )}
            </div>
            
            <Button
              type="button"
              onClick={handleVerifyCode}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  验证中...
                </>
              ) : (
                "验证验证码"
              )}
            </Button>
          </div>
        );
        
      case "reset":
        return (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                验证码验证成功，请设置新密码
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="请输入新密码"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
            
            <Button
              type="button"
              onClick={handleResetPassword}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  重置中...
                </>
              ) : (
                "重置密码"
              )}
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PolicyPulse
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {step === "email" && "找回密码"}
            {step === "verify" && "验证身份"}
            {step === "reset" && "重置密码"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              返回登录
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}