const jwt = require('jsonwebtoken');

// Remplace 1 par l'ID d'un utilisateur existant dans ta table user
const token = jwt.sign({ userId: 2 }, 'SECRET_KEY', { expiresIn: '1h' });

console.log('Token généré:');
console.log(token);
console.log('\nUtilise ce token dans le header "auth-user" de ta requête POST');
