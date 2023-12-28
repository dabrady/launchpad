import { notFound, redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  var { searchParams } = request.nextUrl;
  var code = searchParams.get('code');
  var installationId = searchParams.get('installation_id');

  return fetch(
    'https://67a9-88-98-238-20.ngrok-free.app/launchpad-2e510/europe-west1/install',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        installation_id: installationId,
      }),
    },
  ).catch(
    // NOTE(dabrady) It is important that this 'catch' happens _before_ the 'then',
    // because of the way the Next.js `redirect` function works (it throws an error
    // to halt rendering and pivot to the new URL).
    function reportError(error: Error) {
      console.error(error);
      return notFound();
    }
  ).then(
    function processResponse(response: Response) {
      if (response.ok) {
        // TODO(dabrady) Use response body to index into the new config page
        return redirect('/deploy-configs');
      }
      // TODO handle failures better
      return notFound();
    }
    // NOTE(dabrady) It is important that there is no `catch` here, because Next.js
    // `redirect` function works by throwing an error; an overall catch would thus
    // interfere with the redirection. How stupid.
  );
}
