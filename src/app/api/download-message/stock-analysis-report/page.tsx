import StockAnalysisReportMessageComponent from "@/components/pdfs_templates/stock-report";
import { MarkdownText } from "@/components/thread/markdown-text";
import { ComponentRegistry } from "@/components/thread/messages/component-registry/registry";
import { createClient } from "@/providers/client";
import { StockAnalysis } from "@/types/stock-analysis";
import { Message } from "@langchain/langgraph-sdk";
import { UIMessage } from "@langchain/langgraph-sdk/react-ui";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StockAnalysisReportPage({ searchParams }: Props) {
  const params = await searchParams;
  const threadId = params.threadId;
  const messageId = params.messageId;

  const client = createClient(
    process.env.NEXT_PUBLIC_API_URL!,
    process.env.LANGSMITH_API_KEY,
  );
  const state = await client.threads.getState(threadId as string);
  const messages = (state.values as any)?.messages as Message[];

  const message = messages.find((m) => m.id === messageId);
  const ui = (state.values as any)?.ui as UIMessage[] | undefined;

  const uiComponents = ui?.filter(
    (uiItem: UIMessage) => uiItem.metadata?.message_id === messageId,
  );

  if (!message || !uiComponents) {
    return null;
  }

  return (
    <main>
      {uiComponents.map((uiComponent: UIMessage) => {
        const Component =
          ComponentRegistry[uiComponent.name as keyof typeof ComponentRegistry];

        if (uiComponent.name === "stock_analysis")
          return (
            <StockAnalysisReportMessageComponent
              key={uiComponent.id}
              analysis={uiComponent.props as StockAnalysis}
            />
          );
        return (
          <Component
            key={uiComponent.id}
            {...(uiComponent.props as any)}
          />
        );
      })}
      <MarkdownText>{String(message.content ?? "")}</MarkdownText>;
    </main>
  );
}
