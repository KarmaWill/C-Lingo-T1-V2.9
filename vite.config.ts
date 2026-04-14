import { networkInterfaces } from 'node:os'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Vite prints every IPv4 interface; 198.18.0.0/15 is benchmark space, often used by VPN/proxy (unreachable in browser). */
function lanUrlHintPlugin(port: number): Plugin {
  return {
    name: 'lan-url-hint',
    configureServer(server) {
      const print = () => {
        const rows: { name: string; address: string }[] = []
        for (const [name, addrs] of Object.entries(networkInterfaces())) {
          if (!addrs) continue
          for (const addr of addrs) {
            const fam =
              typeof addr.family === 'string' ? addr.family : String(addr.family)
            if (fam !== 'IPv4' && fam !== '4') continue
            if (addr.internal) continue
            if (addr.address.startsWith('198.18.')) continue
            rows.push({ name, address: addr.address })
          }
        }
        const order = (n: string) => {
          const i = ['en0', 'en1', 'en2'].indexOf(n)
          return i === -1 ? 99 : i
        }
        rows.sort((a, b) => order(a.name) - order(b.name))
        const seen = new Set<string>()
        const unique = rows.filter((r) =>
          seen.has(r.address) ? false : (seen.add(r.address), true)
        )
        if (unique.length === 0) return
        console.log(
          '\n  Tip: Ignore 198.18.x in Vite’s Network list (usually VPN/proxy). On this Mac use Local; for iPad on same Wi‑Fi try:'
        )
        for (const { name, address } of unique) {
          console.log(`  ➜  ${name}:  http://${address}:${port}/`)
        }
      }
      server.httpServer?.once('listening', print)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Read screen size from environment variable
  const screenSize = process.env.VITE_SCREEN_SIZE || '1024x768';
  
  // Determine port based on screen size
  let port = 3000;
  if (screenSize === '2000x1200') {
    port = 3001;
  } else if (screenSize === '960x540') {
    port = 3001;
  } else if (screenSize === '1920x1125') {
    port = 3001;
  } else if (screenSize === '1920x1080') {
    port = 3002;
  }

  return {
  plugins: [react(), lanUrlHintPlugin(port)],
  server: {
      port: port,
      // 监听所有网卡，同一局域网内手机/平板可用本机 IP 访问
      host: true,
    open: true
  },
  preview: {
      port: 4173,
      host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
  };
})

