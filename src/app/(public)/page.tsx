import { CinematicHero } from "@/components/home/cinematic-hero";
import { GoalsShowcase } from "@/components/home/goals/goals-showcase";
import { HomeFeaturedEditorial } from "@/components/home/home-featured-editorial";
import { HomeLatestRiver } from "@/components/home/home-latest-river";
import { HomeMarquee } from "@/components/home/home-marquee";
import { HomePlayChapter } from "@/components/home/home-play-chapter";
import { HomeStatsChapter } from "@/components/home/home-stats-chapter";
import { games } from "@/data/games";
import { quizzes } from "@/data/quizzes";
import {
  getFeaturedArticles,
  getLatestArticles,
  getTopicBySlug,
  mockStats,
} from "@/lib/mock-data";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const featured = getFeaturedArticles();
  const latest = getLatestArticles(3);
  const gameTeasers = games.slice(0, 4);
  const tagline =
    settings.tagline ||
    "Voci della scuola su ONU, pace, giustizia e partnership.";

  const featuredItems = featured.map((article) => ({
    article,
    topic: getTopicBySlug(article.topicSlug),
  }));
  const latestItems = latest.map((article) => ({
    article,
    topic: getTopicBySlug(article.topicSlug),
  }));

  return (
    <div>
      <CinematicHero
        siteName={settings.siteName}
        tagline={tagline}
        statement={settings.description}
      />

      {/* Sipario: sale sopra la scena bloccata dell'hero */}
      <div className="bg-partnership-pattern relative z-10 -mt-10 overflow-clip rounded-t-[2rem] shadow-[0_-28px_80px_-24px_rgb(4_14_26_/_70%)] sm:rounded-t-[3rem]">
        {/* Hook immersivo Goal 16/17 — owned by goals worker */}
        <GoalsShowcase />

        <HomeMarquee />

        <HomeStatsChapter
          articles={mockStats.articles}
          authors={mockStats.authors}
          quizzes={quizzes.length}
        />

        <HomeFeaturedEditorial items={featuredItems} />

        <HomeLatestRiver items={latestItems} />

        <HomePlayChapter games={gameTeasers} />
      </div>
    </div>
  );
}
