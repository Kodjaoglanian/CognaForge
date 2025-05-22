
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
// import { signIn } from 'next-auth/react'; // Exemplo, se usar NextAuth
// import { useRouter } from 'next/navigation'; // Para redirecionamento

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Aqui viria a lógica de autenticação real
    // Exemplo com Firebase (requer configuração do SDK do Firebase):
    /*
    try {
      // await firebaseSignInWithEmailAndPassword(email, password);
      // router.push('/'); // Redireciona para o painel após login
    } catch (err: any) {
      setError(err.message || 'Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
    */

    // Simulação de chamada de API
    setTimeout(() => {
      if (email === 'teste@cogniforge.com' && password === 'senha123') {
        setError(null);
        // router.push('/'); // Redirecionaria para o painel
        alert('Login simulado com sucesso! (Implementação real necessária)');
      } else {
        setError('Credenciais inválidas. Use email "teste@cogniforge.com" e senha "senha123" para a simulação.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
           </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Bem-vindo de volta ao {APP_NAME}!</CardTitle>
          <CardDescription>Acesse sua conta para continuar forjando conhecimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
          {/* <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Esqueceu sua senha?
          </Link> */}
        </CardFooter>
      </Card>
    </div>
  );
}

