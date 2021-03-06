import net from 'net'
import http from 'http'
import { AskForPortsInfo } from '../config/defaultConfig'
export async function tryCallFunction(timeout: number, func: Promise<AskForPortsInfo>): Promise<AskForPortsInfo> {
    const t = new Promise<AskForPortsInfo>((_, reject) => {
        setTimeout(() => {
            reject('')
        }, (timeout));
    })
    return Promise.race([func, t])
}
export async function connectRemoteServer(host: string, port: number): Promise<AskForPortsInfo> {
    return new Promise<AskForPortsInfo>((resolve, reject) => {
        const conn = net.createConnection({
            host: host,
            port: port
        })
        conn.on('connect', () => {
            conn.write('sun')
        })
        conn.on('data', (data: Buffer) => {
            const result = JSON.parse(data.toString())
            resolve({
                localPort: conn.localPort || 0,
                exportPort: Number(result.exportPort),
                ipv4: result.ipv4
            })
        })
        conn.on('error', (err: string) => {
            reject(err)
        })
    })
}
export async function createServer(exportsLocalPort: number, localServicePort: number, localServiceHost: string): Promise<Boolean> {
    return new Promise((resolve, reject) => {
        const server = net.createServer((s) => {
            const connection=net.connect({
                host:localServiceHost,
                port:localServicePort
            },()=>{
                s.pipe(connection).pipe(s)
            })
            connection.on('error',()=>{
                connection.end()
            })
            s.on('error',()=>{
                s.end()
            })
        }).listen(exportsLocalPort)
        server.on('listening', () => {
            resolve(true)
        })
        server.on('error', (err) => {
            reject(err)
        })
    })
}
