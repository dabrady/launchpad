import { httpsCallable } from "firebase/functions";

import { notFound, redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

import { functions } from '#/firebase';

export function GET(request: NextRequest) {
  // TODO delete
  var newComponents = [
    {id: '685244428'},
    {id: '720788997'},
  ];
  var redirectParams = new URLSearchParams(
    newComponents.map(
      function makeParam({ id }) {
        return ['component', id]
      }
    ),
  );
  return redirect(`/deploy-configs?${redirectParams}`);
  // TODO delete

  var { searchParams } = request.nextUrl;
  var code = searchParams.get('code');
  var installationId = searchParams.get('installation_id');
  var install = httpsCallable(functions, 'install');

  return install({
    code,
    installation_id: installationId,
  }).catch(
    // NOTE(dabrady) It is important that this 'catch' happens _before_ the 'then',
    // because of the way the Next.js `redirect` function works (it throws an error
    // to halt rendering and pivot to the new URL).
    function reportError(error: Error) {
      // TODO(dabrady) handle failures better
      return notFound();
    }
  ).then(
    function loadConfigEditor({ data: newComponents }) {
      var redirectParams = new URLSearchParams(
        newComponents.map(
          function makeParam({ id }) {
            return ['component', id]
          }
        ),
      );
      return redirect(`/deploy-configs?${redirectParams}`);
    }
    // NOTE(dabrady) It is important that there is no `catch` here, because Next.js
    // `redirect` function works by throwing an error; an overall catch would thus
    // interfere with the redirection. How stupid.
  );
}
