import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { threadId, messageId } = await request.json();
  if (!threadId || !messageId) {
    return new NextResponse("Please provide a threadId and messageId.", {
      status: 400,
    });
  }

  const origin = request.headers.get("origin");

  const gotoRoute = new URL(
    `${origin}/api/download-message/stock-analysis-report`,
  );
  gotoRoute.searchParams.set("threadId", threadId);
  gotoRoute.searchParams.set("messageId", messageId);

  let browser;
  try {
    const isVercel = !!process.env.VERCEL_ENV;
    let puppeteer: any,
      launchOptions: any = {
        headless: true,
      };

    if (isVercel) {
      const chromium = (await import("@sparticuz/chromium")).default;
      puppeteer = await import("puppeteer-core");
      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      };
    } else {
      puppeteer = await import("puppeteer");
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Use a consistent viewport to avoid reflow when printing to PDF
    await page.setViewport({ width: 768, height: 800, deviceScaleFactor: 1 });

    // Ensure screen CSS (not print CSS) is applied and wait for network + fonts
    await page.emulateMediaType("screen");
    await page.goto(gotoRoute.toString(), { waitUntil: "networkidle0" });
    try {
      await page.evaluate(() => (window as any).document.fonts?.ready);
    } catch (err) {
      console.debug("Skipping font readiness wait:", err);
    }

    // Compute full page height to preserve layout as seen on screen
    const fullHeight = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      );
    });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      width: "864px",
      height: `${fullHeight}px`,
      // height: "1123px",
      scale: 1,
    });
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="screenshot.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      "An error occurred while generating the screenshot.",
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
