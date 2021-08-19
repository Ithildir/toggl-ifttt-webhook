const google = require('@googleapis/fitness');

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_FIT_HYDRATION_DATA_SOURCE_ID,
  GOOGLE_REFRESH_TOKEN,
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'http://localhost'
);

oauth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN,
});

const fitness = google.fitness({
  auth: oauth2Client,
  version: 'v1',
});

async function addHydrationData(liters) {
  const now = String(Date.now() * 1000000);

  await fitness.users.dataSources.datasets.patch({
    datasetId: `${now}-${now}`,
    dataSourceId: GOOGLE_FIT_HYDRATION_DATA_SOURCE_ID,
    requestBody: {
      dataSourceId: GOOGLE_FIT_HYDRATION_DATA_SOURCE_ID,
      minStartTimeNs: now,
      maxEndTimeNs: now,
      point: [
        {
          dataTypeName: 'com.google.hydration',
          endTimeNanos: now,
          startTimeNanos: now,
          value: [
            {
              fpVal: liters,
            },
          ],
        },
      ],
    },
    userId: 'me',
  });

  console.log(`Added ${liters} liters to Google Fit hydration data`);
}

module.exports = {
  addHydrationData,
};
