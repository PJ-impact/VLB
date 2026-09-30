import { createHash } from 'crypto';
import { appendFileSync } from 'fs';

const LOG = 'C:/Users/PRINCE~1/AppData/Local/Temp/opencode/vlb_login_attempts.log';

export function recordAttempt(stage: string, dto: any, extra: string = '') {
  const email = typeof dto?.email === 'string' ? dto.email : String(dto?.email);
  const password = typeof dto?.password === 'string' ? dto.password : String(dto?.password);
  const line = {
    stage,
    email,
    emailLen: email.length,
    emailTrimmedLen: email.trim().length,
    emailHasWhitespace: /\s/.test(email),
    passwordLen: password.length,
    passwordHasLeadingOrTrailingSpace: /^\s|\s$/.test(password),
    passwordFingerprint: createHash('sha256').update(password).digest('hex').slice(0, 8),
    passwordHasNonAscii: /[^\x20-\x7E]/.test(password),
    extra,
    at: new Date().toISOString(),
  };
  appendFileSync(LOG, JSON.stringify(line) + '\n');
}
