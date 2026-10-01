// UserPromptSubmit: stop secrets from being pasted into the conversation.
// Chặn việc dán khoá/token vào hội thoại. Exit 2 = prompt bị xoá và chỉ hiển thị cho người dùng.
import { readInput, findSecrets, block, t, disabled } from './lib.mjs';

if (disabled('prompt-secrets')) process.exit(0);
const { prompt = '' } = readInput();
const found = findSecrets(String(prompt));
if (found.length) {
  const names = [...new Set(found.map((f) => f.name))].join(', ');
  block(
    t({
      en: `Prompt blocked [prompt-secrets]: it appears to contain a secret (${names}). Remove it (use an environment variable name instead), rotate the secret if it is real, and send the prompt again.`,
      vi: `Prompt bị chặn [prompt-secrets]: có vẻ chứa bí mật (${names}). Hãy xoá nó (dùng tên biến môi trường thay thế), thu hồi/đổi khoá nếu là khoá thật, rồi gửi lại.`,
    }),
  );
}
