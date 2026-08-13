import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { server } from './mcp.server';

const router = express.Router();

// A map to store transports by session ID if needed, 
// though typically a single instance might handle one or multiple transports.
const transports = new Map<string, SSEServerTransport>();

router.get('/sse', async (req, res) => {
    console.log("Received new SSE connection request");
    
    // Initialize SSE transport. The URL '/api/mcp/messages' is where the client will POST messages.
    const transport = new SSEServerTransport('/api/mcp/messages', res);
    await server.connect(transport);
    
    transports.set(transport.sessionId, transport);
    console.log(`SSE connection established. Session ID: ${transport.sessionId}`);

    req.on('close', () => {
        console.log(`SSE connection closed for session: ${transport.sessionId}`);
        transports.delete(transport.sessionId);
    });
});

router.post('/messages', async (req, res) => {
    // Note: The client typically appends ?sessionId=... to the POST URL 
    // when using SSEServerTransport.
    const sessionId = req.query.sessionId as string;
    let transport: SSEServerTransport | undefined;
    
    if (sessionId) {
        transport = transports.get(sessionId);
    } else {
        // Fallback: If no sessionId is provided, try to use the first available transport (not ideal for multi-client).
        transport = Array.from(transports.values())[0];
    }

    if (!transport) {
        return res.status(404).send("Active SSE connection not found for this session. Note: This can happen in serverless environments like Vercel due to statelessness.");
    }
    
    await transport.handlePostMessage(req, res);
});

export const mcpRoutes = router;
