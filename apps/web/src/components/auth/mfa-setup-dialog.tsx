'use client';

import { useState } from 'react';
import { multiFactor, TotpMultiFactorGenerator, type TotpSecret } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Loader2, Smartphone, Copy, CheckCircle2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface MfaSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'intro' | 'qr' | 'verify' | 'done';

export function MfaSetupDialog({ open, onOpenChange }: MfaSetupDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleStart = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const multiFactorUser = multiFactor(auth.currentUser);
      const session = await multiFactorUser.getSession();
      const totpSecret = await TotpMultiFactorGenerator.generateSecret(session);
      setSecret(totpSecret);
      const uri = totpSecret.generateQrCodeUrl('DigiFlow', user?.email || 'user@digiflow.app');
      setQrUrl(`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(uri)}`);
      setStep('qr');
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!secret || !auth.currentUser || verificationCode.length !== 6) return;
    setVerifyLoading(true);
    try {
      const multiFactorUser = multiFactor(auth.currentUser);
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
        await multiFactorUser.getSession(),
        secret,
        verificationCode,
      );
      await multiFactorUser.enroll(assertion, 'Authenticator App');
      setStep('done');
      toast.success('MFA enabled successfully');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Check the code and try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (secret) {
      navigator.clipboard.writeText(secret.secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('intro');
      setSecret(null);
      setQrUrl('');
      setVerificationCode('');
      setCopied(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <div>
        <div className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            Multi-Factor Authentication
          </DialogTitle>
          <DialogDescription>Add an extra layer of security to your account</DialogDescription>
        </div>

        {step === 'intro' && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-brand-50 p-4">
              <p className="text-sm text-brand-800">
                MFA adds a second layer of protection. After enabling, you'll need to enter a
                one-time code from your authenticator app when signing in.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</div>
                Install an authenticator app (Google Authenticator, Authy, etc.)
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">2</div>
                Scan the QR code with the app
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">3</div>
                Enter the 6-digit code from the app to verify
              </div>
            </div>
            <Button onClick={handleStart} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
              Set up authenticator app
            </Button>
          </div>
        )}

        {step === 'qr' && (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              {qrUrl ? (
                <div className="h-48 w-48 overflow-hidden rounded-lg border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR Code" className="h-full w-full" />
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-50">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-center text-xs text-gray-500">
              Scan this QR code with your authenticator app
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Or enter this key manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-gray-50 px-3 py-2 text-xs font-mono text-gray-700 border border-gray-200 truncate">
                  {secret?.secretKey}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyKey}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Enter the 6-digit code from the app:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="font-mono text-lg tracking-widest text-center"
                />
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || verifyLoading}
                >
                  {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold">MFA Enabled</h3>
            <p className="text-center text-sm text-gray-500">
              Your account is now protected with multi-factor authentication.
              You'll need a verification code from your authenticator app on your next sign-in.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        )}
      </div>
    </Dialog>
    );
  }
