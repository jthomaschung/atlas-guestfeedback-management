
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function Welcome() {
  const { signIn, resetPassword, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email.endsWith('@atlaswe.com')) {
      setError('Only employees with @atlaswe.com email addresses are allowed to access this system.');
      setIsSubmitting(false);
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email.endsWith('@atlaswe.com')) {
      setError('Only employees with @atlaswe.com email addresses are allowed to access this system.');
      setIsSubmitting(false);
      return;
    }

    const { error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Password reset email sent!",
        description: "Please check your email for password reset instructions.",
      });
      setShowResetPassword(false);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section with Branding */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header Branding */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Branding */}
            <div className="mb-12">
              {/* Atlas Logo */}
              <div className="mb-8 animate-fade-in">
                <img 
                  src="/lovable-uploads/9faa62d6-a114-492a-88df-c8401b255bd5.png" 
                  alt="Atlas Team Logo" 
                  className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 hover-scale"
                />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tight animate-fade-in">
                FACILITIES
              </h1>
              <h2 className="text-2xl md:text-4xl font-bold text-atlas-red mb-8 tracking-wide animate-fade-in">
                GUEST FEEDBACK PORTAL
              </h2>
              
              <p className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wide animate-fade-in">
                NO EXCUSES.
              </p>
              <p className="text-4xl md:text-6xl font-bold text-white tracking-wide">
                JUST SOLUTIONS.
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="flex justify-center pb-12 px-4">
          <div className="w-full max-w-md">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-slate-900">Welcome</CardTitle>
                <CardDescription className="text-slate-600">
                  Sign in to manage work orders
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {!showResetPassword ? (
                  <div className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          placeholder="your.name@atlaswe.com"
                          required
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <Input
                          id="signin-password"
                          name="password"
                          type="password"
                          required
                          className="bg-white"
                        />
                      </div>
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                      </Button>
                      
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(true)}
                          className="text-sm text-red-600 hover:text-red-700 underline"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Reset Password</h3>
                      <p className="text-sm text-slate-600">Enter your email to receive password reset instructions</p>
                    </div>
                    
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          name="email"
                          type="email"
                          placeholder="your.name@atlaswe.com"
                          required
                          className="bg-white"
                        />
                      </div>
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending Reset Email...' : 'Send Reset Email'}
                      </Button>
                      
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowResetPassword(false);
                            setError(null);
                          }}
                          className="text-sm text-slate-600 hover:text-slate-700 underline"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <p className="text-slate-400 text-sm">
                © 2024 Atlas Guest Feedback Portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
