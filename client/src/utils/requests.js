const BACKENDURL = "https://app.mavlon.co/analytics/";

async function FetchData(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response.json();
}
async function FetchRecentActivities(
  accountName,
  emailMessages,
  events,
  opportunityId
) {
  return await FetchData(`${BACKENDURL}recent-activities/`, {
    accountName: accountName,
    emailMessages: emailMessages,
    events: events,
    opportunityId: opportunityId,
  });
}
async function FetchAccountInfo(accountName) {
  return await FetchData(`${BACKENDURL}account-details/`, {
    accountName: accountName,
  });
}

async function FetchAccountNextStep(contacts, emailMessages, opportunityId) {
  return await FetchData(`${BACKENDURL}next-steps/`, {
    contacts: contacts,
    emailMessages: emailMessages,
    opportunityId: opportunityId,
  });
}
async function FetchNeedsAndRisks(contacts, emailMessages, opportunityId) {
  return await FetchData(`${BACKENDURL}needs-risks/`, {
    contacts: contacts,
    emailMessages: emailMessages,
    opportunityId: opportunityId,
  });
}

async function FetchRecentUpdates(accountDetails) {
  return await FetchData(`${BACKENDURL}recent-updates/`, {
    accountDetails: accountDetails,
  });
}

async function FetchValuePropositions(
  accountName,
  accountInfo,
  opportunities,
  recentActivities
) {
  return await FetchData(`${BACKENDURL}value-proposition/`, {
    accountName: accountName,
    accountInfo: accountInfo,
    opportunities: opportunities,
    recentActivities: recentActivities,
  });
}

export {
  FetchRecentActivities,
  FetchAccountInfo,
  FetchAccountNextStep,
  FetchNeedsAndRisks,
  FetchRecentUpdates,
  FetchValuePropositions,
};
