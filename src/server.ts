import express from 'express'
import { OrderController } from './drivers/web/orderController'
import { HealthCheckController } from './drivers/web/healthCheckController'
import { ClientController } from './drivers/web/clientController'
import { ProductController } from './drivers/web/productController'
import { MongoConnection } from './config/mongoConfig'
import { ClientUseCase } from './useCases/client'
import { ProductUseCase } from './useCases/product'
import { MongoClientRepository } from './drivers/database/clientModel'
import { MySQLOrderRepository } from './drivers/database/orderModel'
import { MongoProductRepository } from './drivers/database/productModel'
import { OrderUseCase } from './useCases/order'
import swaggerRouter from './config/swaggerConfig'
import { HealthCheckUseCase } from './useCases/healthCheck'
import { PaymentUseCase } from './useCases/payment'
import { PaymentController } from './drivers/web/paymentController'
import { MercadoPagoController } from './drivers/web/mercadoPagoController'
import { MysqlConnection } from './config/mysqlConfig'
import { PaymentRepository } from './domain/interface/paymentRepository';
import { OrderRepository } from './domain/interface/orderRepository';
import { initializeDatabase } from './config/databaseInitializer';

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
            await this.mysqlConnection.connect();
            await this.mongoConnection.connect(); // Adiciona a conexão com o MongoDB
            await initializeDatabase();
            this.express.use(express.json());
            this.setupRoutes();
            this.startServer();
        } catch (error) {
            console.error('Failed to start application:', error);
        }
    }

    setupRoutes() {
        // Configuração do Client
        const clientRepository = new MongoClientRepository(this.mongoConnection)
        const clientUseCase = new ClientUseCase(clientRepository)
        const routesClientController = new ClientController(clientUseCase)
        this.express.use('/client', routesClientController.setupRoutes())

        // Configuração do Product
        const productRepository = new MongoProductRepository(this.mongoConnection)
        const productUseCase = new ProductUseCase(productRepository)
        const routesProductController = new ProductController(productUseCase)
        this.express.use('/product', routesProductController.setupRoutes())

        // Configuração do Order
        const orderRepository = new MySQLOrderRepository()
        const orderUseCase = new OrderUseCase(orderRepository, clientRepository, productRepository)
        const routesOrderController = new OrderController(orderUseCase)
        this.express.use('/order', routesOrderController.setupRoutes())

        // Configuração do Payment
        const paymentRepository = {} as PaymentRepository; // Mock ou implementação real
        const orderRepositoryForPayment = new MySQLOrderRepository();
        const mercadoPagoController = new MercadoPagoController();
        const paymentUseCase = new PaymentUseCase(paymentRepository, orderRepositoryForPayment, mercadoPagoController);
        const routesPaymentController = new PaymentController(paymentUseCase)
        this.express.use('/payment', routesPaymentController.setupRoutes())

        // Configuração do Health Check e Swagger
        const healthCheckUseCase = new HealthCheckUseCase()
        const routesHealthCheckController = new HealthCheckController(healthCheckUseCase)
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
