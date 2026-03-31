import React, { useState } from "react";
import { auth } from "../../lib/firebase";
import { sendEmailVerification, signOut } from "firebase/auth";
import { Button } from "../UI/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../UI/Card";
import { toast } from "react-hot-toast";
import { Mail, RefreshCw, LogOut, CheckCircle } from "lucide-react";

const VerifyEmail: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setSent(true);
      toast.success("Verification email sent!");
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = () => {
    // Reload the user to get the latest emailVerified status
    auth.currentUser?.reload().then(() => {
      if (auth.currentUser?.emailVerified) {
        toast.success("Email verified!");
        // The App component's onAuthStateChanged will pick up the change if we force a state update
        // but reload() doesn't trigger onAuthStateChanged. 
        // We can just window.location.reload() or rely on the user clicking "I've verified"
        window.location.reload();
      } else {
        toast.error("Email not verified yet. Please check your inbox.");
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-orange-500">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
          <Mail className="text-orange-600 w-6 h-6" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Verify Email</CardTitle>
        <CardDescription className="text-gray-500 font-medium">
          Please verify your email address to access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-gray-600">
          We've sent a verification link to <span className="font-semibold">{auth.currentUser?.email}</span>. 
          Click the link in the email to confirm your account.
        </p>
        
        {sent && (
          <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>New verification email sent!</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={handleCheckStatus} 
            className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700"
          >
            I've verified my email
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleResend} 
            disabled={loading}
            className="w-full h-11 text-base font-semibold"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Resend verification email
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-700 font-semibold flex items-center transition-colors text-sm"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Sign out and try another account
        </button>
      </CardFooter>
    </Card>
  );
};

export default VerifyEmail;
