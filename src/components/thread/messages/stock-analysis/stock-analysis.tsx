"use client";
import { Button } from "@/components/ui/button";
import { Section, StockAnalysis } from "@/types/stock-analysis";
import { useMutation } from "@tanstack/react-query";
import { DownloadIcon, Loader2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { MarkdownText } from "../../markdown-text";
import { ComponentRegistry } from "../component-registry/registry";
import { SectionFormatter } from "@/lib/utils";

export default function StockAnalysisComponent(analysis: StockAnalysis) {
  const [threadId] = useQueryState("threadId");
  const { data } = analysis;
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/download-message", {
        method: "POST",
        body: JSON.stringify({
          threadId: threadId,
          messageId: analysis.id,
        }),
      });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = "screenshot.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    },
  });

  return (
    <div>
      <FormatSection section={data.business_overview} />
      <FormatSection section={data.management_strategy} />
      <FormatSection section={data.sector_outlook} />
      <FormatTechnicalAnalysis
        section={data.technical_analysis}
        returns_line_chart={data.returns_line_chart}
      />
      <FormatSection section={data.fundamental_analysis} />
      <FormatSection section={data.finsharpe_scores} />
      <FormatSection section={data.stats_analysis} />
      <FormatSection section={data.peer_comparison} />
      <FormatSection section={data.conference_call_analysis} />
      <FormatSection section={data.shareholding_pattern} />
      <FormatSection section={data.corporate_actions} />
      <FormatSection section={data.news_sentiment} />
      <FormatSection section={data.red_flags} />
      <FormatSection section={data.summary} />
      <ComponentRegistry.simulation_chart {...data.simulation_chart} />
      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <DownloadIcon className="h-4 w-4" />
              Download Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function FormatSection({ section }: { section: Section }) {
  const formatter = new SectionFormatter(section);
  return <MarkdownText>{formatter.getMarkdown()}</MarkdownText>;
}

export function FormatTechnicalAnalysis({
  section,
  returns_line_chart,
}: {
  section: Section;
  returns_line_chart: Record<string, any>;
}) {
  const formatter = new SectionFormatter(section);
  const title = formatter.getTitleMarkdown();
  const content = formatter.getContentMarkdown();
  const in_depth_analysis = formatter.getInDepthAnalysisMarkdown();
  const sources = formatter.getSourcesMarkdown();

  return (
    <div>
      <MarkdownText>{title}</MarkdownText>
      <div className="space-y-4 pt-4">
        <ComponentRegistry.line_chart {...returns_line_chart} />
      </div>
      <MarkdownText>{content}</MarkdownText>
      <MarkdownText>{in_depth_analysis}</MarkdownText>
      <MarkdownText>{sources}</MarkdownText>
    </div>
  );
}
