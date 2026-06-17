'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AdminAuthLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/admin';
  const supabaseMode = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          supabaseMode
            ? { email, password }
            : { password },
        ),
      });

      if (!response.ok) {
        setError('Invalid credentials. Try again.');
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminAuthLayout>
      <Card className="shadow-tc-sm">
        <CardHeader>
          <CardTitle>TaxChecker Admin</CardTitle>
          <CardDescription>
            {supabaseMode
              ? 'Sign in with your Supabase admin account.'
              : 'Local development login for content operations.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {supabaseMode ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        {!supabaseMode ? (
          <CardFooter className="border-t border-border bg-muted/20 text-xs leading-relaxed text-muted-foreground">
            Local CMS mode uses the dev password from{' '}
            <code className="rounded bg-muted px-1">ADMIN_PASSWORD</code> (default{' '}
            <code className="rounded bg-muted px-1">taxchecker-admin</code>). Content
            is stored in <code className="rounded bg-muted px-1">.data/content/</code>{' '}
            unless configured otherwise.
          </CardFooter>
        ) : null}
      </Card>
    </AdminAuthLayout>
  );
}

function LoginFallback() {
  return (
    <AdminAuthLayout>
      <Card className="shadow-tc-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </AdminAuthLayout>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
