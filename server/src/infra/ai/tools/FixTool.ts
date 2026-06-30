import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const createFixTool = () => {
    return tool(
        async ({ codeSnippet, problemDescription }) => {
            return `Please review the following code snippet:\n${codeSnippet}\nProblem: ${problemDescription}\nProvide the corrected code snippet.`;
        },
        {
            name: "fix_tool",
            description: "Analyzes and fixes code snippets. Triggered by @fix.",
            schema: z.object({
                codeSnippet: z.string().describe("The code snippet that needs fixing"),
                problemDescription: z.string().optional().describe("Optional description of the error"),
            }),
        }
    );
};
