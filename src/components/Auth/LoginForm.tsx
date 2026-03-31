import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../UI/Card";
import { toast } from "react-hot-toast";
import { Mail, Lock, LogIn, UserPlus, Key } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToReset }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Welcome back!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-blue-600">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
          <LogIn className="text-blue-600 w-6 h-6" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Login</CardTitle>
        <CardDescription className="text-gray-500 font-medium">
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-9 text-gray-400 w-4 h-4" />
            <Input
              {...register("email")}
              label="Email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-9 text-gray-400 w-4 h-4" />
            <Input
              {...register("password")}
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 pt-0">
        <div className="flex items-center justify-between w-full text-sm">
          <button
            onClick={onSwitchToReset}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center transition-colors"
          >
            <Key className="w-4 h-4 mr-1.5" />
            Forgot password?
          </button>
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Create account
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
