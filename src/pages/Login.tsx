import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CativeiroLogo } from '@/src/components/CativeiroLogo';
import { signInWithGoogle } from '@/src/lib/firebase';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export function LoginPage({ onLogin }: { onLogin: (userData?: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const user = await signInWithGoogle();
      if (user) {
        // Successful Google authentication
        onLogin({
          name: user.displayName || user.email?.split('@')[0] || 'Usuário',
          email: user.email,
          avatarUrl: user.photoURL || '',
          uid: user.uid
        });
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Falha ao autenticar com o Google. Tente novamente.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    // Simulating standard credential login
    setTimeout(() => {
      setLoading(false);
      onLogin(); // Settle with default user details
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-4 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 mb-3 transition-transform hover:scale-105 duration-300">
            <CativeiroLogo />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight">Projeto Cativeiro</h1>
          <p className="text-muted-foreground mt-2 text-center text-balance text-sm">
            Bem-vindo ao sistema de gestão social. Transformando vidas através do cuidado.
          </p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden p-2">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Acessar Sistema</CardTitle>
            <CardDescription className="text-slate-500">
              Escolha seu método de login para continuar.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-medium text-center">
                {errorMsg}
              </div>
            )}

            {/* Google Authentication Button */}
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full h-11 flex items-center justify-center bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm rounded-xl py-6"
            >
              <GoogleIcon />
              {googleLoading ? 'Conectando...' : 'Entrar com o Google'}
            </Button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">ou</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/80" />
                  <Input 
                    id="email" 
                    placeholder="nome@ong.org" 
                    type="email" 
                    className="pl-11 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white" 
                    required 
                    defaultValue="admin@projeto.org"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Senha</Label>
                  <Button variant="link" type="button" className="px-0 h-auto font-medium text-xs text-primary">
                    Esqueceu a senha?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/80" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-11 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white" 
                    required 
                    defaultValue="password123"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || googleLoading}
                className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl mt-2"
              >
                {loading ? "Verificando..." : (
                  <span className="flex items-center justify-center">
                    Entrar com E-mail <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="pt-2 pb-4 text-center justify-center">
            <p className="text-xs text-slate-400">
              Acesso restrito para administradores e equipe do Cativeiro.
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Precisa de ajuda? <Button variant="link" className="p-0 h-auto font-medium text-xs text-primary/80">Contate o suporte técnico</Button>
        </p>
      </motion.div>
    </div>
  );
}
