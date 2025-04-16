import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportDatabase() {
  try {
    console.log('Gerando dados de exemplo para exportação...');
    
    // Dados de demonstração para cada tabela
    const demoData = {
      users: [
        {
          id: 1,
          username: 'admin',
          password: '2818e810fdced29a4166e8b572c3ccc9b1157447.6f943a7d', // admin123
          name: 'Administrador',
          email: 'admin@exemplo.com',
          role: 'admin_master',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          username: 'gerente',
          password: '2818e810fdced29a4166e8b572c3ccc9b1157447.6f943a7d', // admin123
          name: 'Gerente',
          email: 'gerente@exemplo.com',
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          username: 'cliente',
          password: '2818e810fdced29a4166e8b572c3ccc9b1157447.6f943a7d', // admin123
          name: 'Cliente Exemplo',
          email: 'cliente@exemplo.com',
          role: 'customer',
          created_at: new Date().toISOString()
        }
      ],
      
      categories: [
        { id: 1, name: 'Pizzas', slug: 'pizzas' },
        { id: 2, name: 'Bebidas', slug: 'bebidas' },
        { id: 3, name: 'Sobremesas', slug: 'sobremesas' },
        { id: 4, name: 'Acompanhamentos', slug: 'acompanhamentos' }
      ],
      
      menu_items: [
        { 
          id: 1, 
          name: 'Pizza Margherita', 
          description: 'Molho de tomate, mussarela fresca e manjericão.', 
          price: 45.90, 
          image_url: '/images/margherita.jpg', 
          category_id: 1, 
          tags: JSON.stringify(['Vegetariana', 'Tradicional']), 
          available: true, 
          featured: true 
        },
        { 
          id: 2, 
          name: 'Pizza Calabresa', 
          description: 'Molho de tomate, mussarela e calabresa fatiada.', 
          price: 48.90, 
          image_url: '/images/calabresa.jpg', 
          category_id: 1, 
          tags: JSON.stringify(['Tradicional', 'Popular']), 
          available: true, 
          featured: true 
        },
        { 
          id: 3, 
          name: 'Refrigerante Cola', 
          description: 'Refrigerante de cola gelado (2L).', 
          price: 12.90, 
          image_url: '/images/cola.jpg', 
          category_id: 2, 
          tags: JSON.stringify(['Bebida', 'Refrigerante']), 
          available: true, 
          featured: false 
        },
        { 
          id: 4, 
          name: 'Petit Gateau', 
          description: 'Bolo quente de chocolate com sorvete de creme.', 
          price: 18.90, 
          image_url: '/images/petit-gateau.jpg', 
          category_id: 3, 
          tags: JSON.stringify(['Chocolate', 'Quente']), 
          available: true, 
          featured: false 
        },
        { 
          id: 5, 
          name: 'Pão de Alho', 
          description: 'Porção de pão de alho com queijo gratinado.', 
          price: 15.90, 
          image_url: '/images/pao-de-alho.jpg', 
          category_id: 4, 
          tags: JSON.stringify(['Quente', 'Aperitivo']), 
          available: true, 
          featured: false 
        }
      ],
      
      special_offers: [
        {
          id: 1,
          name: 'Combo Família',
          description: 'Pizza grande de até 2 sabores + 1 refrigerante 2L + 1 sobremesa',
          price: 89.90,
          original_price: 110.90,
          image_url: '/images/combo-familia.jpg',
          active: true
        },
        {
          id: 2,
          name: 'Pizza do Dia',
          description: 'Pizza média de calabresa com borda recheada de catupiry',
          price: 39.90,
          original_price: 54.90,
          image_url: '/images/pizza-do-dia.jpg',
          active: true
        }
      ],
      
      addresses: [
        {
          id: 1,
          user_id: 3,
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 101',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567',
          is_favorite: true,
          created_at: new Date().toISOString()
        }
      ],
      
      orders: [
        {
          id: 1,
          user_id: 3,
          items: JSON.stringify([
            {
              id: 1,
              name: 'Pizza Margherita',
              price: 45.90,
              quantity: 1,
              imageUrl: '/images/margherita.jpg'
            },
            {
              id: 3,
              name: 'Refrigerante Cola',
              price: 12.90,
              quantity: 1,
              imageUrl: '/images/cola.jpg'
            }
          ]),
          subtotal: 58.80,
          delivery_fee: 10.00,
          total: 68.80,
          status: 'delivered',
          payment_method: 'card',
          address: JSON.stringify({
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 101',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zip_code: '01234-567'
          }),
          created_at: new Date(new Date().getTime() - 86400000).toISOString(), // 1 dia atrás
          updated_at: new Date(new Date().getTime() - 86400000 + 3600000).toISOString() // +1 hora
        }
      ],
      
      system_settings: [
        {
          id: 1,
          key: 'business_hours',
          value: JSON.stringify({
            monday: { open: '11:00', close: '22:00', isClosed: false },
            tuesday: { open: '11:00', close: '22:00', isClosed: false },
            wednesday: { open: '11:00', close: '22:00', isClosed: false },
            thursday: { open: '11:00', close: '22:00', isClosed: false },
            friday: { open: '11:00', close: '23:00', isClosed: false },
            saturday: { open: '11:00', close: '23:00', isClosed: false },
            sunday: { open: '11:00', close: '22:00', isClosed: false },
            isManualClosed: false
          }),
          updated_at: new Date().toISOString(),
          updated_by: 1
        },
        {
          id: 2,
          key: 'delivery_settings',
          value: JSON.stringify({
            fee: 10.00,
            estimatedTime: 45,
            minimumOrderValue: 30.00,
            supportedNeighborhoods: ['Centro', 'Jardins', 'Pinheiros', 'Vila Mariana', 'Moema']
          }),
          updated_at: new Date().toISOString(),
          updated_by: 1
        },
        {
          id: 3,
          key: 'order_settings',
          value: JSON.stringify({
            allowDelivery: true,
            allowPickup: true,
            estimatedPickupTime: 25
          }),
          updated_at: new Date().toISOString(),
          updated_by: 1
        },
        {
          id: 4,
          key: 'general_preferences',
          value: JSON.stringify({
            newOrderSound: true,
            showAlerts: true,
            sendCustomerNotifications: false
          }),
          updated_at: new Date().toISOString(),
          updated_by: 1
        }
      ]
    };
    
    // Criar arquivo SQL com os dados
    let sqlContent = '-- Arquivo de exportação de dados do PizzaApp\n';
    sqlContent += '-- Gerado em: ' + new Date().toISOString() + '\n\n';
    
    // Adicionar comandos para desativar/ativar restrições
    sqlContent += 'BEGIN TRANSACTION;\n\n';
    sqlContent += '-- Desativar restrições de chave estrangeira temporariamente\n';
    sqlContent += 'PRAGMA foreign_keys = OFF;\n\n';
    
    // Limpar tabelas existentes
    sqlContent += '-- Limpar tabelas existentes\n';
    const tables = Object.keys(demoData);
    tables.forEach(table => {
      sqlContent += `DELETE FROM ${table};\n`;
    });
    sqlContent += '\n';
    
    // Adicionar dados para cada tabela
    for (const [table, records] of Object.entries(demoData)) {
      sqlContent += `-- Inserir dados na tabela ${table}\n`;
      
      records.forEach(record => {
        const columns = Object.keys(record).join(', ');
        const values = Object.values(record).map(value => {
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          return value;
        }).join(', ');
        
        sqlContent += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
      });
      
      sqlContent += '\n';
    }
    
    // Restaurar sequência para autoincremento
    sqlContent += '-- Atualizar sequências dos IDs\n';
    tables.forEach(table => {
      if (demoData[table].length > 0) {
        const maxId = Math.max(...demoData[table].map(r => r.id));
        sqlContent += `-- Atualizar sequência para a tabela ${table}\n`;
        sqlContent += `UPDATE sqlite_sequence SET seq = ${maxId} WHERE name = '${table}';\n`;
      }
    });
    sqlContent += '\n';
    
    // Reativar restrições de chave estrangeira
    sqlContent += '-- Reativar restrições de chave estrangeira\n';
    sqlContent += 'PRAGMA foreign_keys = ON;\n\n';
    
    sqlContent += 'COMMIT;\n';
    
    // Salvar arquivo
    const outputPath = path.join(__dirname, 'demo-data.sql');
    await fs.writeFile(outputPath, sqlContent);
    
    console.log('Arquivo de dados de exemplo gerado com sucesso:', outputPath);
    console.log('Use este arquivo para popular o banco de dados local com dados iniciais.');
    
  } catch (error) {
    console.error('Erro ao exportar o banco de dados:', error);
  }
}

// Executar a função
exportDatabase();