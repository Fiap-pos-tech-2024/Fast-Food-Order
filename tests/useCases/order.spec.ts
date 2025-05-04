import { OrderUseCase } from '../../src/useCases/order'
import { OrderRepository } from '../../src/domain/interface/orderRepository'
import { Order } from '../../src/domain/entities/order'
import { ORDER_STATUS } from '../../src/constants/order'
import { ProductRepository } from '../../src/domain/interface/productRepository'

describe('orderUseCase', () => {
    let OrderRepository: jest.Mocked<OrderRepository>
    let productRepository: jest.Mocked<ProductRepository>
    let useCase: OrderUseCase

    beforeEach(() => {
        OrderRepository = {
            getOrder: jest.fn(),
            createOrder: jest.fn(),
            updateOrder: jest.fn(),
            deleteOrder: jest.fn(),
            updateOrderStatus: jest.fn(),
            updatePayment: jest.fn(),
            listOrders: jest.fn(),
            getActiveOrders: jest.fn(),
        }

        productRepository = {
            findById: jest.fn(),
            findByCategory: jest.fn(),
            list: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }

        useCase = new OrderUseCase(
            OrderRepository,
            productRepository
        )
    })

    describe('listOrders', () => {
        it('should return a list of orders', async () => {
            const ordersData: Order[] = [
                {
                    idOrder: '123',
                    paymentId: null,
                    paymentLink: null,
                    cpf: '000.000.000-00',
                    name: 'John Doe',
                    email: 'john@example.com',
                    status: 'RECEIVED',
                    value: 10,
                    items: [{ idProduct: 'Item 1' }, { idProduct: 'Item 2' }],
                } as Order,
            ]
            OrderRepository.listOrders.mockResolvedValue(ordersData)

            const result = await useCase.listOrders()

            expect(result).toEqual(ordersData)
            expect(OrderRepository.listOrders).toHaveBeenCalledTimes(1)
        })
    })

    describe('createOrder', () => {
        it('should save a new order', async () => {
            const orderData: Order = {
                cpf: '000.000.000-00',
                name: 'John Doe',
                email: 'new@example.com',
                status: 'RECEIVED',
                value: 10,
                items: [
                    {
                        idProduct: '6726be94d9bec010f0fdf613',
                        amount: 10,
                        observation: 'Observação opcional sobre o item',
                    },
                ],
            } as Order

            await useCase.createOrder(orderData)

            expect(OrderRepository.createOrder).toHaveBeenCalledWith(orderData)
            expect(OrderRepository.createOrder).toHaveBeenCalledTimes(1)
        })
    })

    describe('updateOrder', () => {
        it('should update order data if order exists', async () => {
            const orderId = '1'
            const updadatedOrderData: Order = {
                idOrder: '1',
                paymentId: null,
                paymentLink: null,
                idClient: null,
                cpf: null,
                name: null,
                email: null,
                status: 'RECEIVED',
                value: 10,
            } as Order

            OrderRepository.getOrder.mockResolvedValue(updadatedOrderData)

            await useCase.updateOrder(orderId, updadatedOrderData)

            expect(OrderRepository.getOrder).toHaveBeenCalledWith(orderId)
            expect(OrderRepository.updateOrder).toHaveBeenCalledWith(
                orderId,
                updadatedOrderData
            )
        })

        it('should throw an error if order does not exist', async () => {
            const orderId = '1'
            const updadatedOrderData: Order = {
                idOrder: '1',
                paymentId: null,
                paymentLink: null,
                idClient: null,
                cpf: null,
                name: null,
                email: null,
                status: 'RECEIVED',
                value: 10,
            } as Order

            OrderRepository.getOrder.mockResolvedValue(null)

            await expect(
                useCase.updateOrder(orderId, updadatedOrderData)
            ).rejects.toThrow('Order does not exist')
            expect(OrderRepository.updateOrder).not.toHaveBeenCalled()
        })
    })

    describe('deleteOrder', () => {
        it('should delete a order by id if the order exists', async () => {
            const orderId = '1'
            const orderData: Order = {
                idOrder: '1',
                paymentId: null,
                paymentLink: null,
                idClient: null,
                cpf: null,
                name: null,
                email: null,
                status: 'RECEIVED',
                value: 10,
            } as Order

            OrderRepository.getOrder.mockResolvedValue(orderData)

            await useCase.deleteOrder(orderId)

            expect(OrderRepository.getOrder).toHaveBeenCalledWith(orderId)
            expect(OrderRepository.deleteOrder).toHaveBeenCalledWith(orderId)
        })

        it('should throw an error if order does not exist', async () => {
            const orderId = '1'
            OrderRepository.getOrder.mockResolvedValue(null)

            await expect(useCase.deleteOrder(orderId)).rejects.toThrow(
                'Order does not exist'
            )
            expect(OrderRepository.deleteOrder).not.toHaveBeenCalled()
        })
    })

    describe('getOrder', () => {
        it('should return a order by id', async () => {
            const orderId = '1'
            const orderData: Order = {
                idOrder: '1',
                paymentId: null,
                paymentLink: null,
                idClient: null,
                cpf: null,
                name: null,
                email: null,
                status: 'RECEIVED',
                value: 10,
            } as Order
            OrderRepository.getOrder.mockResolvedValue(orderData)

            const result = await useCase.getOrder(orderId)

            expect(result).toEqual(orderData)
            expect(OrderRepository.getOrder).toHaveBeenCalledWith(orderId)
        })

        it('should return null if order does not exist', async () => {
            const orderId = '1'
            OrderRepository.getOrder.mockResolvedValue(null)

            const result = await useCase.getOrder(orderId)

            expect(result).toBeNull()
            expect(OrderRepository.getOrder).toHaveBeenCalledWith(orderId)
        })
    })

    describe('updateOrderStatus', () => {
        it('should send correctly params', async () => {
            const orderId = '1'
            const status = ORDER_STATUS.IN_PREPARATION
            OrderRepository.updateOrderStatus.mockResolvedValue()

            await useCase.updateOrderStatus(orderId, status)

            expect(OrderRepository.updateOrderStatus).toHaveBeenCalledWith(
                orderId,
                status
            )
        })
    })
    describe('getActiveOrders', () => {
        it('should return only active and paid orders, sorted by creation date', async () => {
            const ordersData: Order[] = [
                {
                    idOrder: '1',
                    idPayment: 'pay_123',
                    idClient: '1',
                    cpf: '000.000.000-00',
                    name: 'John Doe',
                    email: 'john@example.com',
                    status: 'RECEIVED',
                    value: 10,
                    items: [
                        {
                            idProduct: 'Item 1',
                            name: 'Produto 1',
                            amount: 2,
                            unitValue: 5.0,
                            observation: '',
                            createdAt: new Date('2024-01-01T09:00:00Z'),
                            updatedAt: new Date('2024-01-01T10:00:00Z'),
                            deletedAt: null,
                            category: 'Lanche',
                            calculateTotalValue: () => 10.0,
                        },
                        {
                            idProduct: 'Item 1',
                            name: 'Produto 1',
                            amount: 2,
                            unitValue: 5.0,
                            observation: '',
                            createdAt: new Date('2024-01-01T09:00:00Z'),
                            updatedAt: new Date('2024-01-01T10:00:00Z'),
                            deletedAt: null,
                            category: 'Lanche',
                            calculateTotalValue: () => 10.0,
                        },
                    ],
                    createdAt: new Date('2024-01-01T10:00:00Z'),
                    paymentLink: 'http://example.com',
                    paymentId: 'pay_123',
                } as Order,
                {
                    idOrder: '2',
                    idPayment: 'pay_456',
                    idClient: '2',
                    cpf: '111.111.111-11',
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    status: 'IN_PREPARATION',
                    value: 20,
                    paymentLink: 'http://example.com',
                    paymentId: 'pay_123',
                    items: [
                        {
                            idProduct: 'Item 1',
                            name: 'Produto 1',
                            amount: 2,
                            unitValue: 5.0,
                            observation: '',
                            createdAt: new Date('2024-01-01T09:00:00Z'),
                            updatedAt: new Date('2024-01-01T10:00:00Z'),
                            deletedAt: null,
                            category: 'Lanche',
                            calculateTotalValue: () => 10.0,
                        },
                    ],
                    createdAt: new Date('2024-01-02T12:00:00Z'),
                } as Order,
            ]

            OrderRepository.getActiveOrders.mockResolvedValue(ordersData)

            const result = await useCase.getActiveOrders()

            expect(result[0].idOrder).toBe('1')
            expect(result[1].idOrder).toBe('2')
            expect(OrderRepository.getActiveOrders).toHaveBeenCalledTimes(1)
        })
    })
})
