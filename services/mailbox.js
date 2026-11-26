import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { requireEnv } from '../config/env.js';
import { testConfig } from '../config/test.config.js';

const POLL_MS = 5_000;
// The IMAP server's date search works by day; allow for clock and time-zone drift.
const DAY_MS = 24 * 60 * 60 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const textOf = (html) =>
  html
    .replace(/<(style|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ')
    .trim();

function connect() {
  return new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: requireEnv('CUSTOMER_EMAIL'), pass: requireEnv('GMAIL_APP_PASSWORD') },
    logger: false,
  });
}

/** Inbox and Spam: mail may land in either. */
async function foldersToSearch(client) {
  const folders = await client.list();
  const spam = folders.find((folder) => folder.specialUse === '\\Junk');
  return ['INBOX', ...(spam ? [spam.path] : [])];
}

/** Every message to the address received since the given time, oldest first. */
async function findMessages(client, to, since) {
  const found = [];
  for (const path of await foldersToSearch(client)) {
    const lock = await client.getMailboxLock(path);
    try {
      const uids = await client.search(
        { to, since: new Date(since.getTime() - DAY_MS) },
        { uid: true },
      );
      for (const uid of uids || []) {
        const { source } = await client.fetchOne(uid, { source: true }, { uid: true });
        const mail = await simpleParser(source);
        const sentTo = mail.to?.value?.map((address) => address.address.toLowerCase()) ?? [];
        if (sentTo.includes(to.toLowerCase()) && mail.date >= since) found.push(mail);
      }
    } finally {
      lock.release();
    }
  }
  return found.sort((a, b) => a.date - b.date);
}

/**
 * Waits until `count` messages to the address have arrived since `since`
 * and returns them, oldest first, as { subject, to, html, text }.
 */
export async function waitForEmails(
  to,
  { since, count = 1, timeout = testConfig.timeouts.emailArrival },
) {
  const client = connect();
  await client.connect();
  try {
    const deadline = Date.now() + timeout;
    for (;;) {
      const messages = await findMessages(client, to, since);
      if (messages.length >= count) {
        return messages.map((mail) => ({
          subject: mail.subject,
          to: mail.to.value.map((address) => address.address.toLowerCase()),
          html: mail.html || '',
          // The plain-text part is only a placeholder, so the text is read from the HTML.
          text: textOf(mail.html || ''),
        }));
      }
      if (Date.now() > deadline) {
        throw new Error(`Expected ${count} email(s) to ${to}, found ${messages.length}`);
      }
      await sleep(POLL_MS);
    }
  } finally {
    await client.logout();
  }
}

export async function waitForEmail(to, options) {
  return (await waitForEmails(to, { ...options, count: 1 }))[0];
}

/** Waits the whole window and returns how many messages to the address arrived. */
export async function countEmailsAfterWaiting(
  to,
  { since, window = testConfig.timeouts.noEmailWindow },
) {
  await sleep(window);
  const client = connect();
  await client.connect();
  try {
    return (await findMessages(client, to, since)).length;
  } finally {
    await client.logout();
  }
}

/**
 * The reset link in a reset email: { path, uid, token }. path is relative to the site,
 * so the link opens on the site under test whatever host the email names.
 * The button goes through the mail provider's click tracking, so this reads the plain
 * link printed under it.
 */
export function resetLinkIn(email) {
  const match = email.text.match(/https?:\/\/\S+\/reset-password\?\S+/);
  if (!match) throw new Error('The email has no reset link');
  const url = new URL(match[0]);
  return {
    path: `${url.pathname}${url.search}`,
    uid: url.searchParams.get('uid'),
    token: url.searchParams.get('token'),
  };
}
