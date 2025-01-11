import axios from 'axios';
import { supabase } from '../lib/supabase';

export async function initializeDatabase() {
  try {
    // Fetch data from the third-party API
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Transform and insert data into Supabase
    const { error } = await supabase.from('transactions').insert(
      transactions.map((transaction: any) => ({
        product_id: transaction.id,
        title: transaction.title,
        price: transaction.price,
        description: transaction.description,
        category: transaction.category,
        sold: transaction.sold,
        date_of_sale: transaction.dateOfSale
      }))
    );

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
}