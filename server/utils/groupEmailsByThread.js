export function groupEmailsByThread(emailMessages) {
  try {
    const threads = {};
    emailMessages.forEach((email) => {
      const threadId = email["ThreadId"];
      if (threadId) {
        if (!threads[threadId]) threads[threadId] = [];
        threads[threadId].push(email);
      }
    });
    const groupedThreads = {};
    Object.keys(threads).forEach((threadId) => {
      const emails = threads[threadId];
      let startEmail = null;
      for (const email of emails) {
        if (!email["ReplyToEmailMessageId"]) {
          startEmail = email;
          break;
        }
      }
      if (!startEmail) {
        console.log(
          `Skipping malformed thread ${threadId}: No starting email found.`
        );
        return;
      }
      const orderedEmails = [];
      let currentEmail = startEmail;
      while (currentEmail) {
        orderedEmails.push(currentEmail);
        const replyToId = currentEmail["EmailId"];
        let nextEmail = null;
        for (const email of emails) {
          if (email["ReplyToEmailMessageId"] === replyToId) {
            nextEmail = email;
            break;
          }
        }
        currentEmail = nextEmail;
      }
      groupedThreads[threadId] = orderedEmails;
    });
    return groupedThreads;
  } catch (e) {
    console.error("Failed to group emails by thread:", e);
    return {};
  }
}
