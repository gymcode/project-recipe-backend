const redis = require("redis")

const client = redis.createClient(
    {
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD
    }
)
client.on('error', (err: any) => console.log('Redis Client Error', err))
client.connect()

export default client
