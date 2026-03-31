import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth } from "../../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../UI/Card";
import { toast } from "react-hot-toast";
import { Mail, Key, ArrowLeft, Send } from "lucide-react";

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

interface ResetPasswordFormProps {
  onSwitchToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      console.error("Reset error:", error);
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-blue-600">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
          <Key className="text-blue-600 w-6 h-6" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
        <CardDescription className="text-gray-500 font-medium">
          Enter your email and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-100 font-medium">
              Check your inbox for the password reset link.
            </div>
            <Button onClick={onSwitchToLogin} variant="outline" className="w-full">
              Back to login
            </Button>
          </div>
        ) : (
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
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}
      </CardContent>
      {!sent && (
        <CardFooter className="flex flex-col space-y-3 pt-0">
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to login
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ResetPasswordForm;
