import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../UI/Card";
import { toast } from "react-hot-toast";
import { UserPlus, Mail, Lock, User, ArrowLeft } from "lucide-react";

const registerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.displayName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        displayName: data.displayName,
        role: "user",
        createdAt: serverTimestamp(),
      });

      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-blue-600">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
          <UserPlus className="text-blue-600 w-6 h-6" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Register</CardTitle>
        <CardDescription className="text-gray-500 font-medium">
          Join AuthDash to access your personal dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-9 text-gray-400 w-4 h-4" />
            <Input
              {...register("displayName")}
              label="Full Name"
              placeholder="John Doe"
              error={errors.displayName?.message}
              className="pl-10"
            />
          </div>
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
          <div className="relative">
            <Lock className="absolute left-3 top-9 text-gray-400 w-4 h-4" />
            <Input
              {...register("confirmPassword")}
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 pt-0">
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to login
        </button>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
