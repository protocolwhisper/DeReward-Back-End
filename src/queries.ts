import axios from 'axios';

export async function fetchProfileId(ethereumAddress) {
  const endpoint = 'https://api.lens.dev/';
  const query = `
      query {
          defaultProfile(request: { ethereumAddress: "${ethereumAddress}" }) {
              id
              name
              bio
          }
      }
  `;
    try {
        const response = await axios.post(endpoint, { query });

        // Extract profileId from the response data
        const profileId = response.data.data.defaultProfile.id;
        console.log(profileId);

        return profileId;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
