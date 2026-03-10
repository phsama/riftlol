const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:ujg%21ze%3Fv_%40r2F9Q@db.onvhjecibcjismangnhz.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    // Get user id
    const userRes = await client.query("SELECT id FROM auth.users WHERE email = 'ph.sama@gmail'");
    if (userRes.rowCount === 0) {
      console.log('User not found');
      return;
    }
    const uid = userRes.rows[0].id;
    console.log('User ID:', uid);

    // Get card ids
    const cardsRes = await client.query("SELECT id, name FROM cards WHERE name LIKE '%Ahri%Alluring%'");
    console.log('Cards found:', cardsRes.rows.map(c => c.name));
    
    // Delete from collections
    const deleteRes = await client.query(
      "DELETE FROM collections WHERE user_id = $1 AND card_id IN (SELECT id FROM cards WHERE name LIKE '%Ahri%Alluring%')",
      [uid]
    );
    
    console.log('Rows deleted from collections:', deleteRes.rowCount);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
