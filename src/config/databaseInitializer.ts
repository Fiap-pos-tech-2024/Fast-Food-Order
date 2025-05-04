import { getConnection } from './mysqlConfig';

export async function initializeDatabase(): Promise<void> {
    const connection = await getConnection();

    // Criação da tabela orders
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            idClient VARCHAR(255) NOT NULL,
            cpf VARCHAR(11) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            items JSON NOT NULL,
            value DECIMAL(10, 2) NOT NULL,
            paymentLink VARCHAR(255),
            paymentId VARCHAR(255)
        );
    `);

    // Criação da tabela clients
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS clients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cpf VARCHAR(11) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL
        );
    `);

    // Criação da tabela products
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            amount INT NOT NULL,
            unitValue DECIMAL(10, 2) NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Criação da tabela payments
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            idOrder INT NOT NULL,
            idClient INT NOT NULL,
            value DECIMAL(10, 2) NOT NULL,
            status VARCHAR(50) NOT NULL,
            FOREIGN KEY (idOrder) REFERENCES orders(id),
            FOREIGN KEY (idClient) REFERENCES clients(id)
        );
    `);

    console.log('Database initialized successfully');
}