import { MarkdownText } from "@/components/thread/markdown-text";
import { ComponentRegistry } from "@/components/thread/messages/component-registry/registry";
import { SectionFormatter } from "@/lib/utils";
import { Section, StockAnalysis } from "@/types/stock-analysis";
import Welcome from "./Welcome";

export default function StockAnalysisReportMessageComponent({
  analysis,
}: {
  analysis: StockAnalysis;
}) {
  const { data } = analysis;
  return (
    <>
      <Welcome analysis={analysis} />
      <div className="mx-12 max-w-3xl space-y-8 pt-12">
        <FormatSection section={data.business_overview} />
        <FormatSection
          section={data.management_strategy}
          displaySources
        />
        <FormatSection section={data.sector_outlook} />
        <FormatTechnicalSection
          section={data.technical_analysis}
          returns_line_chart={data.returns_line_chart}
        />
        <FormatSection section={data.fundamental_analysis} />
        <FormatSection section={data.finsharpe_scores} />
        <FormatSection section={data.stats_analysis} />
        <FormatSection section={data.peer_comparison} />
        <FormatSection
          section={data.conference_call_analysis}
          displaySources
        />
        <FormatSection
          section={data.shareholding_pattern}
          displaySources
        />
        <FormatSection
          section={data.corporate_actions}
          displaySources
        />

        <FormatSection
          section={data.news_sentiment}
          displaySources
        />
        <FormatSection section={data.red_flags} />
        <FormatSection section={data.summary} />
        <ComponentRegistry.simulation_chart {...data.simulation_chart} />

        <div className="mt-8" />
        <hr className="border-t-2 border-gray-800" />
        <div className="mt-8" />
        <h3 className="text-3xl font-semibold tracking-tight">Data Sources and In-depth Analysis</h3>
        {[
          data.technical_analysis,
          data.fundamental_analysis,
          data.finsharpe_scores,
          data.stats_analysis,
          data.peer_comparison,
        ].map((section, idx, arr) => (
          <div key={section.title}>
            <FormatSectionSourcesAndInDepthAnalysis section={section} />
            {idx < arr.length - 1 && <hr className="my-4 border-t-2" />}
          </div>
        ))}
      </div>
    </>
  );
}

function FormatSectionSourcesAndInDepthAnalysis({
  section,
}: {
  section: Section;
}) {
  const formatter = new SectionFormatter(section);
  const source = formatter.getSource();
  const title = section.title;
  const in_depth_analysis = section.in_depth_analysis;
  const anchorId = formatter.getAnchorId();

  if (!in_depth_analysis && !source) {
    return null;
  }

  return (
    <div
      id={`refs-${anchorId}`}
      className="space-y-2 text-sm"
    >
      <h6>
        <a
          className="text-primary font-medium underline underline-offset-4"
          href={`#${anchorId}`}
        >
          {title}
        </a>
      </h6>
      {in_depth_analysis && (
        <MarkdownText>{`<details open><summary>In-depth Analysis</summary>\n\n${in_depth_analysis}\n</details>\n`}</MarkdownText>
      )}
      {source && (
        <MarkdownText>{`<details open><summary>Sources</summary>\n\n${source}\n</details>\n`}</MarkdownText>
      )}
    </div>
  );
}

function FormatTechnicalSection({
  section,
  returns_line_chart,
}: {
  section: Section;
  returns_line_chart: Record<string, any>;
}) {
  const formatter = new SectionFormatter(section);
  const title = formatter.getTitleMarkdown();
  const content = `${formatter.getContentMarkdown()}\n---\n`;
  const anchorId = formatter.getAnchorId();
  const hasRefs = Boolean(section.in_depth_analysis || formatter.getSource());

  return (
    <div className="space-y-4">
      <div id={anchorId} />
      <MarkdownText>{title}</MarkdownText>
      {hasRefs && (
        <div className="text-xs">
          <a
            className="text-primary font-medium underline underline-offset-4"
            href={`#refs-${anchorId}`}
          >
            Sources & In-depth Analysis
          </a>
        </div>
      )}
      <ComponentRegistry.line_chart {...returns_line_chart} />
      <MarkdownText>{content}</MarkdownText>
    </div>
  );
}

function FormatSection({
  section,
  displaySources = false,
}: {
  section: Section;
  displaySources?: boolean;
}) {
  const formatter = new SectionFormatter(section);
  const title = formatter.getTitleMarkdown();
  const content = `${formatter.getContentMarkdown()}\n---\n`;
  const sources = formatter.getSourcesMarkdown();
  const anchorId = formatter.getAnchorId();
  const hasRefs = Boolean(section.in_depth_analysis || formatter.getSource());

  return (
    <div className="space-y-4">
      <div id={anchorId} />
      <MarkdownText>{title}</MarkdownText>
      {hasRefs && (
        <div className="text-xs">
          <a
            className="text-primary font-medium underline underline-offset-4"
            href={`#refs-${anchorId}`}
          >
            Sources & In-depth Analysis
          </a>
        </div>
      )}
      <MarkdownText>{content}</MarkdownText>
      {displaySources && <MarkdownText>{sources}</MarkdownText>}
    </div>
  );
}
