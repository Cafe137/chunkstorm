import { MerkleTree } from 'cafe-utility'
import { createServer } from 'http'
import { Stamper } from './stamper'

const stamper = Stamper.fromBlank(
    0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdefn,
    new Uint8Array(32),
    30
)
let stampings = 0

const server = createServer((request, response) => {
    const before = Date.now()
    const chunks: Buffer[] = []
    request.on('data', chunk => chunks.push(chunk))
    request.on('end', async () => {
        const data = Buffer.concat(chunks)
        const tree = new MerkleTree(async chunk => {
            stamper.stamp(chunk)
            stampings++
        })
        await tree.append(data)
        await tree.finalize()
        response.write(`Time taken: ${Date.now() - before}ms, Stampings: ${stampings}`)
        response.end()
    })
})
server.listen(3000)
