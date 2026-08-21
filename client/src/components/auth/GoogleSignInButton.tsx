import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';

interface GoogleSignInButtonProps {
  /** Google ID token (JWT) from Sign In With Google — not an access token. */
  onSuccess: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
}

export const GoogleSignInButton = ({ onSuccess, disabled }: GoogleSignInButtonProps) => {
  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error('Google authentication failed');
      return;
    }
    void onSuccess(response.credential);
  };

  return (
    <div
      className={`w-full mb-6 flex justify-center ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Google authentication failed')}
        theme="outline"
        size="large"
        text="continue_with"
        shape="pill"
        width="384"
        useOneTap={false}
      />
    </div>
  );
};
