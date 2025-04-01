const BACKENDURL = "https://edc1-3-80-188-57.ngrok-free.app/";

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
  return await FetchData(`${BACKENDURL}recentActivities/`, {
    accountName: accountName,
    emailMessages: emailMessages,
    events: events,
    opportunityId: opportunityId,
  });
}
async function FetchAccountInfo(accountName) {
  return await FetchData(`${BACKENDURL}accountDetails/`, {
    accountName: accountName,
  });
}

async function FetchAccountNextStep(contacts, emailMessages, opportunityId) {
  return await FetchData(`${BACKENDURL}nextSteps/`, {
    contacts: contacts,
    emailMessages: emailMessages,
    opportunityId: opportunityId,
  });
}
async function FetchNeedsAndRisks(contacts, emailMessages, opportunityId) {
  return await FetchData(`${BACKENDURL}needsAndRisk/`, {
    contacts: contacts,
    emailMessages: emailMessages,
    opportunityId: opportunityId,
  });
}

async function FetchRecentUpdates(accountDetails) {
  return await FetchData(`${BACKENDURL}recentUpdates/`, {
    accountDetails: accountDetails,
  });
}

async function FetchValuePropositions(
  accountName,
  accountInfo,
  opportunities,
  recentActivities
) {
  return await FetchData(`${BACKENDURL}strategy/`, {
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
