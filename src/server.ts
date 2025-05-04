import express from 'express'
import { OrderController } from './drivers/web/orderController'
import { HealthCheckController } from './drivers/web/healthCheckController'
import { MongoConnection } from './config/mongoConfig'
import { MySQLOrderRepository } from './drivers/database/orderModel'
import { MongoProductRepository } from './drivers/database/productModel'
import { OrderUseCase } from './useCases/order'
import swaggerRouter from './config/swaggerConfig'
import { HealthCheckUseCase } from './useCases/healthCheck'
import { MysqlConnection } from './config/mysqlConfig'
import { initializeDatabase } from './config/databaseInitializer'

class InitProject {
    public express: express.Application
    public mysqlConnection: MysqlConnection
    public mongoConnection: MongoConnection

    constructor() {
        this.express = express()
        this.mysqlConnection = MysqlConnection.getInstance()
        this.mongoConnection = MongoConnection.getInstance() // Adiciona a conexão MongoDB
        this.express.use(express.urlencoded({ extended: true }))
        this.start()
    }

    async start() {
        try {
            await this.mysqlConnection.connect()
            await this.mongoConnection.connect() // Adiciona a conexão com o MongoDB
            await initializeDatabase()
            this.express.use(express.json())
            this.setupRoutes()
            this.startServer()
        } catch (error) {
            console.error('Failed to start application:', error)
        }
    }

    setupRoutes() {
        // Configuração do Product
        const productRepository = new MongoProductRepository(
            this.mongoConnection
        )
        const orderRepository = new MySQLOrderRepository()
        const orderUseCase = new OrderUseCase(
            orderRepository,
            productRepository
        )
        const routesOrderController = new OrderController(orderUseCase)
        this.express.use('/order', routesOrderController.setupRoutes())

        const healthCheckUseCase = new HealthCheckUseCase()
        const routesHealthCheckController = new HealthCheckController(
            healthCheckUseCase
        )
        this.express.use('/health', routesHealthCheckController.setupRoutes())
        this.express.use('/api-docs', swaggerRouter)
    }

    startServer() {
        this.express.listen(3000, () => {
            console.log('Server is running on port 3000')
        })
    }
}

new InitProject()
