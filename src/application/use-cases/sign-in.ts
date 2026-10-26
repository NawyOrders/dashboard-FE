import type { AuthRepository } from '@/application/ports';
import type {
  PlatformLoginRequest,
  PlatformLoginResult,
} from '@/domain/entities';

export type SignInInput = PlatformLoginRequest;

export interface SignInDeps {
  auth: AuthRepository;
}

export function makeSignIn(deps: SignInDeps) {
  return async (input: SignInInput): Promise<PlatformLoginResult> =>
    deps.auth.signIn(input);
}
