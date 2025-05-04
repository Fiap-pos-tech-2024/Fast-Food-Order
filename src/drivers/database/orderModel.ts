import { getConnection } from '../../config/mysqlConfig'
import {
    ORDER_STATUS_LIST,
    ORDER_STATUS_LIST_ACTIVE,
} from '../../constants/order'
import { Order } from '../../domain/entities/order'
import { OrderRepository } from '../../domain/interface/orderRepository'

export class MySQLOrderRepository implements OrderRepository {
    async createOrder(order: Order): Promise<string> {
        const connection = await getConnection()
        const [result]: any = await connection.execute(
            `INSERT INTO orders (idClient, cpf, name, email, status, items, value) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                order.idClient || null, // Torna idClient opcional
                order.cpf ? order.cpf.replace(/\D/g, '') : null, // Remove pontos e torna CPF opcional
                order.name,
                order.email,
                order.status,
                JSON.stringify(order.items),
                order.value,
            ]
        )
        return result.insertId.toString()
    }

    async getOrder(orderId: string): Promise<Order | null> {
        const connection = await getConnection()
        const [rows]: any = await connection.execute(
            `SELECT * FROM orders WHERE id = ?`,
            [orderId]
        )
        if (rows.length > 0) {
            const order = rows[0]
            return new Order({
                idOrder: order.id,
                idClient: order.idClient,
                cpf: order.cpf,
                name: order.name,
                email: order.email,
                status: order.status,
                items:
                    typeof order.items === 'string'
                        ? JSON.parse(order.items)
                        : order.items,
                value: order.value,
                paymentLink: order.paymentLink ?? null,
                paymentId: order.paymentId ?? null,
            })
        }
        return null
    }

    async updateOrder(orderId: string, updatedOrderData: Order): Promise<void> {
        try {
            const connection = await getConnection()
            await connection.execute(
                `UPDATE orders SET idClient = ?, cpf = ?, name = ?, email = ?, status = ?, items = ?, value = ? WHERE id = ?`,
                [
                    updatedOrderData.idClient || null, // Substitui undefined por null
                    updatedOrderData.cpf
                        ? updatedOrderData.cpf.replace(/\D/g, '')
                        : null, // Remove pontos e substitui undefined por null
                    updatedOrderData.name || null,
                    updatedOrderData.email || null,
                    updatedOrderData.status || null,
                    JSON.stringify(
                        updatedOrderData.items || updatedOrderData.items || []
                    ), // Garante que items nunca seja null
                    updatedOrderData.value || null,
                    orderId,
                ]
            )
        } catch (error) {
            console.error('Error updating order:', error)
            throw new Error('Failed to update order')
        }
    }

    async deleteOrder(orderId: string): Promise<void> {
        const connection = await getConnection()
        await connection.execute(`DELETE FROM orders WHERE id = ?`, [orderId])
    }

    async updateOrderStatus(orderId: string, status: string): Promise<void> {
        const connection = await getConnection()
        await connection.execute(`UPDATE orders SET status = ? WHERE id = ?`, [
            status,
            orderId,
        ])
    }

    async updatePayment(orderId: string, paymentId: string): Promise<void> {
        const connection = await getConnection()
        await connection.execute(
            `UPDATE orders SET idPayment = ? WHERE id = ?`,
            [paymentId, orderId]
        )
    }

    async listOrders(): Promise<Order[]> {
        const connection = await getConnection()
        const [rows]: any = await connection.execute(`SELECT * FROM orders`)
        let itens = []
        try {
            itens = rows.map((order: any) => {
                return new Order({
                    idOrder: order.id,
                    idClient: order.idClient,
                    cpf: order.cpf,
                    name: order.name,
                    email: order.email,
                    status: order.status,
                    items:
                        typeof order.items === 'string'
                            ? JSON.parse(order.items)
                            : order.items,
                    value: order.value,
                    paymentLink: order.paymentLink ?? null,
                    paymentId: order.paymentId ?? null,
                })
            })
        } catch (error) {
            console.error('Error parsing items:', error)
            throw new Error('Failed to parse items from database')
        }

        return itens
    }

    async getActiveOrders(): Promise<Order[]> {
        const connection = await getConnection()
        const [rows]: any = await connection.execute(
            `SELECT * FROM orders WHERE status IN (${ORDER_STATUS_LIST.map(() => '?').join(',')})`,
            ORDER_STATUS_LIST_ACTIVE
        )
        return rows.map((order: any) => {
            return new Order({
                idOrder: order.id,
                idClient: order.idClient,
                cpf: order.cpf,
                name: order.name,
                email: order.email,
                status: order.status,
                items:
                    typeof order.items === 'string'
                        ? JSON.parse(order.items)
                        : order.items,
                value: order.value,
                paymentLink: order.paymentLink ?? null,
                paymentId: order.paymentId ?? null,
            })
        })
    }
}
