
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
// import { createUser } from '@/actions/auth'; // Exemplo de Server Action
// import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!fullName.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Aqui viria a lógica de cadastro real
    // Exemplo com Firebase (requer configuração do SDK do Firebase):
    /*
    try {
      // const userCredential = await firebaseCreateUserWithEmailAndPassword(email, password);
      // await firebaseUpdateProfile(userCredential.user, { displayName: fullName });
      // setSuccess('Conta criada com sucesso! Você pode fazer login agora.');
      // router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Falha ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
    */
    
    // Simulação de chamada de API
    setTimeout(() => {
      // Simulação simples
      if (email && password && fullName) {
         setSuccess(`Conta para ${fullName} criada com sucesso! (Simulação). Você seria redirecionado ou poderia fazer login.`);
         // router.push('/login');
      } else {
        setError('Ocorreu um erro ao criar a conta. Verifique os campos. (Simulação)');
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
          <CardTitle className="text-2xl font-bold tracking-tight">Crie sua conta no {APP_NAME}</CardTitle>
          <CardDescription>Junte-se à comunidade e comece a forjar seu conhecimento hoje mesmo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
                placeholder="Crie uma senha forte (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-500 text-center">{success}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Criar Conta
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Faça Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

