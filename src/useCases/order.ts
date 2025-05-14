import { Order } from '../domain/entities/order'
import { OrderRepository } from '../domain/interface/orderRepository'
import { ProductRepository } from '../domain/interface/productRepository'
import { Product } from '../domain/entities/product'
import { ORDER_STATUS } from '../constants/order'
import { v4 } from 'uuid'

export class OrderUseCase {
    constructor(
        private orderRepository: OrderRepository,
        private productRepository: ProductRepository
    ) {}

    async getOrder(id: string): Promise<Order | null> {
        return this.orderRepository.getOrder(id)
    }
    async getActiveOrders(): Promise<Order[]> {
        return this.orderRepository.getActiveOrders()
    }

    async listProducts(): Promise<Product[]> {
        return this.productRepository.listProducts()
    }

    async createOrder(order: Order): Promise<string> {
        if (order.items?.length === 0) {
            throw new Error('Order must have at least one item')
        }

        if (order.idOrder) {
            const existingOrder = await this.getOrder(order.idOrder)
            if (existingOrder) {
                throw new Error('Order already exists')
            }
        }

        const itemsDetails: Product[] = []
        order.value = 0

        for (const item of order.items) {
            console.log('item 2')

            const existingProduct = await this.productRepository.findById(
                item.idProduct
            )

            if (!existingProduct) {
                console.log('Product not found')
                // throw new Error(`Product with id ${item.idProduct} not found`)
                // continue
            }

            const productDetail = new Product({
                idProduct: item.idProduct,
                name: item.name,
                amount: item.amount,
                unitValue: item.amount ?? 0,
                observation: item.observation ?? null,
                createdAt: new Date(),
                updatedAt: null,
                deletedAt: null,
                category: item.category ?? null,
                calculateTotalValue: function () {
                    return this.unitValue * this.amount
                },
            })

            itemsDetails.push(productDetail)
            order.value += productDetail.calculateTotalValue()
        }

        order.idOrder = v4()
        // idOrder remove -
        order.idOrder = order.idOrder.replace(/-/g, '')
        order.idClient = order.idClient ?? null
        order.idClient = order.idClient?.replace(/-/g, '') ?? null
        order.items = itemsDetails
        order.status = ORDER_STATUS.AWAITING_PAYMENT

        try {
            const result = await this.orderRepository.createOrder(order)
            return result
        } catch (error) {
            console.error('Error creating order:', error)
            throw new Error('Failed to create order')
        }
    }

    async updateOrder(id: string, order: Order) {
        const existingOrder = await this.getOrder(id)

        if (!existingOrder) {
            throw new Error('Order does not exist')
        }

        if (order.idClient) {
            order.idClient = order.idClient.replace(/-/g, '')
        }
        return this.orderRepository.updateOrder(id, order)
    }

    async deleteOrder(id: string) {
        const existingOrder = await this.getOrder(id)
        if (!existingOrder) {
            throw new Error('Order does not exist')
        }
        return this.orderRepository.deleteOrder(id)
    }

    async updateOrderStatus(id: string, status: string): Promise<void> {
        return this.orderRepository.updateOrderStatus(id, status)
    }

    async listOrders(): Promise<Order[]> {
        return this.orderRepository.listOrders()
    }
}
