'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, Globe, Clock, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MfaSetupDialog } from '@/components/auth/mfa-setup-dialog';

export default function SettingsPage() {
  const { user, profile, logout } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [delegateInput, setDelegateInput] = useState('');
  const [delegateStart, setDelegateStart] = useState('');
  const [delegateEnd, setDelegateEnd] = useState('');
  const [savingDelegation, setSavingDelegation] = useState(false);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);

  useEffect(() => {
    if (profile?.delegatedTo) {
      setDelegateInput(profile.delegatedTo.name || '');
      setDelegateStart(profile.delegatedTo.startDate ? new Date(profile.delegatedTo.startDate).toISOString().split('T')[0] : '');
      setDelegateEnd(profile.delegatedTo.endDate ? new Date(profile.delegatedTo.endDate).toISOString().split('T')[0] : '');
    }
  }, [profile]);

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  function switchLanguage() {
    const next = locale === 'en' ? 'ne' : 'en';
    startTransition(() => {
      router.replace(pathname, { locale: next as 'en' | 'ne' });
    });
  }

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully');
  }

  async function handleSaveDelegation() {
    if (!user) return;
    setSavingDelegation(true);
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        delegatedTo: {
          uid: delegateInput,
          name: delegateInput,
          startDate: new Date(delegateStart),
          endDate: new Date(delegateEnd),
        },
      });
      toast.success('Delegation saved');
    } catch {
      toast.error('Failed to save delegation');
    } finally {
      setSavingDelegation(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-brand-600" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{user?.displayName || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role || 'Loading...'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-brand-600" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Language</Label>
              <p className="text-sm text-gray-500">{locale === 'en' ? 'English' : 'नेपाली'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={switchLanguage} disabled={isPending}>
              {isPending ? '...' : locale === 'en' ? 'Switch to नेपाली' : 'Switch to English'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications</Label>
              <p className="text-sm text-gray-500">Receive email and push notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-gray-500">Toggle dark theme</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Session Timeout</Label>
              <p className="text-sm text-gray-500">30 minutes of inactivity</p>
            </div>
            <select className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
              <option>15 min</option>
              <option selected>30 min</option>
              <option>1 hour</option>
              <option>Never</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-brand-600" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Change Password</Label>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Multi-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setMfaDialogOpen(true)}>Enable</Button>
          </div>
        </CardContent>
      </Card>

      {/* Out of Office */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-brand-600" />
            Out of Office Delegation
          </CardTitle>
          <CardDescription>Assign a delegate to handle your approvals while you're away</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Delegate User</Label>
            <Input value={delegateInput} onChange={(e) => setDelegateInput(e.target.value)} placeholder="Search for a user..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={delegateStart} onChange={(e) => setDelegateStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={delegateEnd} onChange={(e) => setDelegateEnd(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSaveDelegation} disabled={savingDelegation}>
            {savingDelegation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {profile?.delegatedTo?.uid ? 'Update Delegation' : 'Save Delegation'}
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <div className="pt-2">
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <MfaSetupDialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen} />
    </div>
  );
}
