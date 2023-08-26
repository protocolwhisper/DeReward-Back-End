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
// This is just for mocking the queries 
export const urls = [
  'https://example1.com',
  'https://example2.com',
  'https://example3.com'
];

export function getRandomUrls(count: number = 1): string[] {
  // Ensure count isn't greater than the number of available URLs
  count = Math.min(count, urls.length);

  // Shuffle the URLs array
  const shuffled = urls.sort(() => 0.5 - Math.random());

  // Get the first 'count' URLs from the shuffled array
  return shuffled.slice(0, count);
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
