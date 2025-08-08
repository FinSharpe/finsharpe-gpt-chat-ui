import { AIMessage, ToolMessage } from "@langchain/langgraph-sdk";
import { AnimatePresence, motion } from "framer-motion";
import { ComponentRegistry } from "./component-registry/registry";
import { ChevronRightIcon } from "lucide-react";
import { MarkdownText } from "../markdown-text";

function isComplexValue(value: any): boolean {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

export function ToolCalls({
  toolCalls,
}: {
  toolCalls: AIMessage["tool_calls"];
}) {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      {toolCalls.map((tc, idx) => {
        const args = tc.args as Record<string, any>;

        const hasArgs = Object.keys(args).length > 0;
        return (
          <div
            key={idx}
            className="overflow-hidden rounded-lg border border-gray-200"
          >
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
              <h3 className="font-medium text-gray-900">
                {tc.name}
                {tc.id && (
                  <code className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm">
                    {tc.id}
                  </code>
                )}
              </h3>
            </div>
            {hasArgs ? (
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(args).map(([key, value], argIdx) => (
                    <tr key={argIdx}>
                      <td className="px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-900">
                        {key}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {isComplexValue(value) ? (
                          <code className="rounded bg-gray-50 px-2 py-1 font-mono text-sm break-all">
                            {JSON.stringify(value, null, 2)}
                          </code>
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <code className="block p-3 text-sm">{"{}"}</code>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ToolResult({ message }: { message: ToolMessage }) {
  let parsedContent: any;
  let isJsonContent = false;

  try {
    if (typeof message.content === "string") {
      parsedContent = JSON.parse(message.content);
      isJsonContent = isComplexValue(parsedContent);
    }
  } catch {
    // Content is not JSON, use as is
    parsedContent = message.content;
  }

  const shouldRenderRegisteredComponent =
    isJsonContent &&
    Boolean(parsedContent?.name) &&
    parsedContent?.type === "ui" &&
    parsedContent.name in ComponentRegistry;

  if (!shouldRenderRegisteredComponent) return null;

  return (
    <div className="mx-auto grid min-w-[calc(100dvw-2rem)] grid-rows-[1fr_auto] gap-2 md:min-w-3xl">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <h3 className="font-medium text-gray-900">
            {parsedContent?.props?.title}
          </h3>
        </div>
        <motion.div
          className="bg-gray-100"
          initial={false}
          animate={{ height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-3">
            <AnimatePresence
              mode="wait"
              initial={false}
            >
              {shouldRenderRegisteredComponent &&
                (() => {
                  const Component =
                    ComponentRegistry[
                      parsedContent.name as keyof typeof ComponentRegistry
                    ];
                  return <Component {...parsedContent.props} />;
                })()}
            </AnimatePresence>
          </div>
          {/* Description */}
          {parsedContent?.props?.description && (
            <div className="border-t border-gray-200 p-3">
              <p className="text-sm text-gray-500">
                {parsedContent?.props?.description}
              </p>
            </div>
          )}
          {/* Analysis */}
          {parsedContent?.props?.analysis && (
            <div className="markdown-content">
              <details className="!m-0 rounded-lg border border-gray-200 bg-gray-50">
                <summary className="flex cursor-pointer items-center font-medium hover:bg-gray-100">
                  <ChevronRightIcon className="h-4 w-4 transition-transform duration-200" />
                  Analysis
                </summary>
                <div className="p-3">
                  <MarkdownText>{parsedContent?.props?.analysis}</MarkdownText>
                </div>
              </details>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
