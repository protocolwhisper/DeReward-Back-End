import fetch from 'node-fetch';

// ----------- Type Definitions -------------
interface DefaultProfileRequest {
  ethereumAddress: string;
}

// ----------- Constants -------------
const ENDPOINT = 'https://api-mumbai.lens.dev/';
const QUERY = `
  query DefaultProfile($ethereumAddress: String!) {
    defaultProfile(request: { ethereumAddress: $ethereumAddress }) {
      id
      name
      bio
    }
  }
`;

// ----------- Functions -------------
export const getProfileDetails = async (ethereumAddress: string): Promise<string | null> => {
  
  const variables: DefaultProfileRequest = {
    ethereumAddress,
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.defaultProfile?.id) {
      return data.defaultProfile.id;
    } else {
      console.error('Unexpected response structure:', data);
      return null;
    }
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
};
