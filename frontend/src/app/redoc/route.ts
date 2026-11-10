import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const REDOC_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="https://fastapi.tiangolo.com/img/favicon.png">
<title>UrjaKavach - JSL Stainless Steel Carbon & Energy Engine - ReDoc</title>
<style>
  body {
    margin: 0;
    padding: 0;
  }
</style>
</head>
<body>
<noscript>
  ReDoc requires Javascript to function. Please enable it to browse the documentation.
</noscript>
<redoc spec-url="/openapi.json"></redoc>
<script src="https://cdn.jsdelivr.net/npm/redoc@2/bundles/redoc.standalone.js"></script>
</body>
</html>`;

export async function GET() {
  return new NextResponse(REDOC_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
