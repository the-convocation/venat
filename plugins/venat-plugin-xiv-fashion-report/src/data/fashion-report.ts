import { Scraper, Tweet } from '@the-convocation/twitter-scraper';

const fullDetailsRegex =
  /(?<title>Fashion Report Week (\d+)\s-\sFull Details)/g;
const maxPointsRegex = /(?<title>Fashion Report Week (\d+)\s-\s100 pts)/g;
const themeRegex = /(?<title>Fashion Report Week (\d+))\s[^-]/g;

export enum FashionReportKind {
  Theme,
  MaxPoints,
  FullDetails,
}

export interface FashionReportInfo {
  kind: FashionReportKind;
  image: string;
  title: string;
}

export async function getFashionReportInfographic(
  scraper: Scraper,
  kind: FashionReportKind,
): Promise<FashionReportInfo | null> {
  let pattern: RegExp;
  switch (kind) {
    case FashionReportKind.FullDetails:
      pattern = fullDetailsRegex;
      break;
    case FashionReportKind.MaxPoints:
      pattern = maxPointsRegex;
      break;
    case FashionReportKind.Theme:
      pattern = themeRegex;
      break;
    default:
      throw new Error(`Invalid report kind received: "${kind}"`);
  }

  for await (const tweet of scraper.getTweets('KaiyokoStar', 100, false)) {
    if (tweet.text == null) {
      continue;
    }

    const match = pattern.exec(tweet.text);
    if (match && tweet.photos.length > 0) {
      return parseTweet(tweet, kind, match);
    }
  }

  return null;
}

function parseTweet(
  tweet: Tweet,
  kind: FashionReportKind,
  match: RegExpExecArray,
): FashionReportInfo {
  const groups = match.groups ?? {};
  return {
    kind,
    image: tweet.photos[0],
    title: groups['title'] ?? '',
  };
}
