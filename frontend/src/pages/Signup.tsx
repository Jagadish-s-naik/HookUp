import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Github, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            referred_by: refCode
          }
        },
      });

      if (error) throw error;

      toast.success('Account created! Please check your email for confirmation.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 glass overflow-hidden rounded-2xl relative z-10">
        {/* Left side - Content */}
        <div className="p-8 md:p-12 bg-primary text-white flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-8">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Start creating viral hooks in seconds.</h2>
            <p className="text-primary-foreground/80 mb-8">
              Join 5,000+ creators who use HookAI to dominate social media.
            </p>
            
            <ul className="space-y-4">
              {[
                'AI-powered viral hook generation',
                'Multi-platform support (IG, TikTok, X)',
                'Brand voice personalization',
                'Advanced content analytics',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white/40" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-12 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <p className="text-xs italic text-white/70">
              "HookAI changed my workflow. My engagement increased by 300% in just two weeks!"
            </p>
            <p className="text-xs font-bold mt-2">— Alex Rivera, Content Creator</p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="p-8 md:p-12 bg-white dark:bg-slate-900">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Free forever for your first 5 hooks/day.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Get Started Free
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full gap-2 text-xs">
                <img src="https://www.google.com/favicon.ico" className="w-3 h-3" alt="Google" />
                Google
              </Button>
              <Button variant="outline" className="w-full gap-2 text-xs">
                <Github className="w-3 h-3" />
                GitHub
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
