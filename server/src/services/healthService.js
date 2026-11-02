import { getConnectionStatus } from '../config/db.js';
import { config } from '../config/env.js';

/**
 * Service to aggregate server and infrastructure health diagnostics.
 */
export const healthService = {
  getHealthStatus: (isVerbose = false) => {
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;

    const dbStatus = getConnectionStatus();

    const healthData = {
      status: 'healthy',
      service: 'NOVAMART API Backend',
      version: '1.0.0',
      apiVersion: 'v1',
      environment: config.env,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptimeSeconds,
        formatted: formattedUptime
      },
      database: {
        status: dbStatus.state,
        connected: dbStatus.isConnected,
        host: dbStatus.host || 'N/A',
        databaseName: dbStatus.name || 'N/A'
      }
    };

    if (isVerbose) {
      const memoryUsage = process.memoryUsage();
      healthData.system = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memoryUsage: {
          rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
          heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100
        }
      };
    }

    return healthData;
  }
};

export default healthService;
