import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('🧪 Testando conexão com MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ CONEXÃO BEM-SUCEDIDA!');
    console.log('📊 Database:', mongoose.connection.name);
    process.exit(0);
    
  } catch (error) {
    console.log('❌ FALHA NA CONEXÃO:');
    console.log('   - Erro:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Solução: Verifique usuário e senha no Atlas');
    }
    
    process.exit(1);
  }
}

testConnection();