import { ServeHtmlArgs, ServeHtmlMetadata } from './types'
import {
  FabPluginRuntime,
  FabResponderArgs,
  FabSettings,
  matchPath,
  NO_RESPONSE_STATUS_CODE,
} from '@fab/core'
import { DEFAULT_INJECTIONS } from './constants'
import { generateReplacements } from './injections/env'
import { ITokens } from 'micromustache'

// Todo: this should be part of the context.
// Maybe it should be optional though, with this as the fallback.
const getNonce = () => {
  return Math.random()
    .toString(16)
    .slice(2)
}

export const runtime: FabPluginRuntime<ServeHtmlArgs, ServeHtmlMetadata> = (
  args: ServeHtmlArgs,
  metadata: ServeHtmlMetadata
) => {
  const { injections = DEFAULT_INJECTIONS } = args

  const { htmls, resolved_fallback } = metadata.serve_html
  const error_page = matchPath(htmls, '/404')

  function render(html: ITokens, settings: FabSettings) {
    const replacements: { [token: string]: string } = {
      OPEN_TRIPLE: '{{{',
      OPEN_DOUBLE: '{{',
    }

    if (injections.env) {
      Object.assign(replacements, generateReplacements(injections.env, settings))
    }

    const rendered = stringify(html, replacements)

    return new Response(rendered, {
      status: html === error_page ? 404 : 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }

  return async function responder({ url, settings }: FabResponderArgs) {
    const { pathname } = url

    const html = matchPath(htmls, pathname)
    if (html) {
      return render(html, settings)
    }

    if (resolved_fallback)
      return {
        async interceptResponse(response: Response) {
          return response.status === NO_RESPONSE_STATUS_CODE
            ? render(htmls[resolved_fallback], settings)
            : response
        },
      }

    if (error_page)
      return {
        async interceptResponse(response: Response) {
          return response.status === NO_RESPONSE_STATUS_CODE
            ? render(error_page, settings)
            : response
        },
      }

    return undefined
  }
}

function stringify(tokens: ITokens, values: { [key: string]: string }): string {
  const { strings, varNames } = tokens
  let ret = ''
  const { length } = varNames
  for (let i = 0; i < length; i++) {
    ret += strings[i]
    ret += values[varNames[i]]
  }

  ret += strings[length]
  return ret
}
