export function mscpOpenAiTolls(
    tools: {
        name: string;
        description?: string;
        inputSchema: any;
    }[]
) {
    return tools.map((tool) => ({
        type: "function" as const,
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema
    })
    )
}