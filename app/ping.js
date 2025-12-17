// Create this file at /api/ping.js in your project
// This will be deployed as a Cloudflare Worker function

export async function onRequestPost(context) {
    try {
        const { ip } = await context.request.json();
        
        // Validate IP address format
        const ipRegex = /^([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
        
        if (!ipRegex.test(ip)) {
            return new Response(JSON.stringify({ 
                status: 'skipped', 
                error: 'Invalid IP format' 
            }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            });
        }
        
        // Use Cloudflare's special socket API to perform a TCP ping
        // Note: This is a simplified approach using a TCP connection attempt
        const startTime = Date.now();
        let isConnected = false;
        
        try {
            // Try to establish a TCP connection to port 80 (commonly open)
            const socket = new Socket();
            await socket.connect({ address: ip, port: 80 });
            isConnected = true;
            socket.close();
        } catch (error) {
            isConnected = false;
        }
        
        const responseTime = Date.now() - startTime;
        
        return new Response(JSON.stringify({
            status: isConnected ? 'online' : 'offline',
            responseTime: isConnected ? `${responseTime}ms` : null
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            status: 'offline', 
            error: error.message 
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
