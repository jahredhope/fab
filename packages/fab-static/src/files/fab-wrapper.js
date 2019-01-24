/*
* Static FAB Wrapper
*
* Entry point for the Static FAB Webpack build
*
* */

const url = require('url')
const htmls = require('./htmls')

const render = async (req, settings) => {
  const req_url = url.parse(req.url)
  const { path } = req_url
  console.log({path})

  const matched_html = htmls[path] || htmls[path + (path.endsWith('/') ? '' : '/') + 'index.html']
  if (matched_html) {
    const headers = {}
    headers['content-type'] = 'text/html'

    const rendered_html = matched_html({
      FAB_ENV_INJECTION: `<script>window.FAB_SETTINGS=${JSON.stringify(settings)};</script>`,
      FAB_NONCE: 'noncey'
    })

    return new Response(rendered_html, {
      status: 200,
      statusText: 'OK',
      headers
    })
  }

  return new Response(null, {
    status: 404,
    statusText: 'Not Found',
    headers: {}
  })
}

module.exports = { render }