import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';
import type { InputProps } from './Input';
import { en } from '@/presentation/i18n/en';

export type PasswordInputProps = Omit<InputProps, 'type'>;

/**
 * Password field (NW-247). The value is always masked; the button only reveals it on
 * screen. The value itself is never written to a log, a toast or the console.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? en.common.hidePassword : en.common.showPassword}
            className="flex size-8 items-center justify-center rounded-panel text-text-muted transition-colors duration-150 hover:bg-bg-2 hover:text-text"
          >
            {visible ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        }
      />
    );
  },
);
