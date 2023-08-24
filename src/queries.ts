import fetch from 'node-fetch';

interface DefaultProfileRequest {
  ethereumAddress: string;
}

export const getProfileDetails = async (ethereumAddress: string): Promise<any> => {
  const endpoint = 'https://api-mumbai.lens.dev/';
  const query = `
    query DefaultProfile($ethereumAddress: String!) {
      defaultProfile(request: { ethereumAddress: $ethereumAddress }) {
        id
        name
        bio
      }
    }
  `;

  const variables: DefaultProfileRequest = {
    ethereumAddress: ethereumAddress,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
};
