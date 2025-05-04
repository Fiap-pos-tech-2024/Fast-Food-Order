import mysql, { Connection } from 'mysql2/promise'

export class MysqlConnection {
    private static instance: MysqlConnection
    private connection: Connection | null = null
    private readonly config = {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'fiap',
    }

    private constructor() {}

    public static getInstance(): MysqlConnection {
        if (!MysqlConnection.instance) {
            MysqlConnection.instance = new MysqlConnection()
        }
        return MysqlConnection.instance
    }

    public async connect(): Promise<void> {
        if (!this.connection) {
            try {
                this.connection = await mysql.createConnection(this.config)
                console.log('Connected to MySQL')
            } catch (error) {
                console.error('Error connecting to MySQL:', error)
                throw new Error('Failed to connect to MySQL')
            }
        }
    }

    public getConnection(): Connection {
        if (!this.connection) {
            throw new Error('Database not connected')
        }
        return this.connection
    }

    public async close(): Promise<void> {
        if (this.connection) {
            await this.connection.end()
            this.connection = null
            console.log('MySQL connection closed')
        }
    }
}
